import { NextRequest, NextResponse } from "next/server";
import { verifyManageAuth, unauthorizedResponse } from "@/lib/manage-auth";

export const dynamic = "force-dynamic";

function assessWebsite(url: string): string {
  if (!url) return "NO WEBSITE";
  const lower = url.toLowerCase();
  if (lower.includes("facebook.com")) return "Facebook Only";
  if (lower.includes("yelp.com")) return "Yelp Only";
  if (lower.includes("yellowpages")) return "Yellow Pages Only";
  if (lower.includes("bbb.org")) return "BBB Only";
  return "Has Website";
}

async function scrapeYelp(query: string, location: string): Promise<Array<Record<string, unknown>>> {
  const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(query)}&find_loc=${encodeURIComponent(location)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) return [];

  const html = await res.text();

  // Extract JSON-LD structured data from Yelp pages
  const results: Array<Record<string, unknown>> = [];

  // Parse business cards from Yelp HTML
  // Yelp embeds business data in script tags as JSON
  const scriptMatches = html.match(/<!--(\{[\s\S]*?\})-->/g) || [];
  for (const match of scriptMatches) {
    try {
      const json = JSON.parse(match.replace("<!--", "").replace("-->", ""));
      if (json?.searchPageProps?.mainContentComponentsListProps) {
        const items = json.searchPageProps.mainContentComponentsListProps;
        for (const item of items) {
          if (item?.bizId) {
            results.push({
              name: item.searchResultBusiness?.name || "",
              address: [
                item.searchResultBusiness?.addressLines?.[0] || "",
                item.searchResultBusiness?.addressLines?.[1] || "",
              ].filter(Boolean).join(", "),
              phone: item.searchResultBusiness?.phone || "",
              rating: item.searchResultBusiness?.rating || null,
              reviews: item.searchResultBusiness?.reviewCount || 0,
              website: "",
              mapsUrl: `https://www.yelp.com/biz/${item.bizId}`,
            });
          }
        }
      }
    } catch {
      // Not valid JSON, skip
    }
  }

  // Fallback: regex parsing from HTML if JSON extraction didn't work
  if (results.length === 0) {
    // Try to extract from regular HTML patterns
    const namePattern = /data-testid="serp-ia-title"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
    const names: string[] = [];
    let nameMatch;
    while ((nameMatch = namePattern.exec(html)) !== null) {
      names.push(nameMatch[1].trim());
    }

    // Extract addresses
    const addrPattern = /class="css-[^"]*"[^>]*>(\d+[^<]{5,60}(?:St|Ave|Rd|Dr|Blvd|Ln|Way|Ct|Pl|Pkwy|Hwy|Cir)[^<]{0,40})<\/span>/gi;
    const addresses: string[] = [];
    let addrMatch;
    while ((addrMatch = addrPattern.exec(html)) !== null) {
      addresses.push(addrMatch[1].trim());
    }

    // Extract phone numbers
    const phonePattern = /\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/g;
    const phones: string[] = [];
    let phoneMatch;
    while ((phoneMatch = phonePattern.exec(html)) !== null) {
      phones.push(`(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`);
    }
    // Deduplicate phones
    const uniquePhones = Array.from(new Set(phones));

    for (let i = 0; i < names.length; i++) {
      results.push({
        name: names[i],
        address: addresses[i] || "",
        phone: uniquePhones[i] || "",
        rating: null,
        reviews: 0,
        website: "",
        mapsUrl: "",
      });
    }
  }

  return results;
}

async function scrapeYellowPages(query: string, location: string): Promise<Array<Record<string, unknown>>> {
  const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(query)}&geo_location_terms=${encodeURIComponent(location)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) return [];

  const html = await res.text();
  const results: Array<Record<string, unknown>> = [];

  // YellowPages uses structured HTML with clear class names
  // Extract business names, addresses, phones from the page
  const businessPattern = /<a class="business-name"[^>]*>.*?<span>([^<]+)<\/span>/g;
  const addressPattern = /<div class="street-address">([^<]+)<\/div>/g;
  const localityPattern = /<div class="locality">([^<]+)<\/div>/g;
  const phonePatternYP = /<div class="phones phone primary">([^<]+)<\/div>/g;
  const websitePattern = /<a class="track-visit-website"[^>]*href="([^"]+)"/g;

  const names: string[] = [];
  const addrs: string[] = [];
  const cities: string[] = [];
  const phones: string[] = [];
  const websites: string[] = [];

  let m;
  while ((m = businessPattern.exec(html)) !== null) names.push(m[1].trim());
  while ((m = addressPattern.exec(html)) !== null) addrs.push(m[1].trim());
  while ((m = localityPattern.exec(html)) !== null) cities.push(m[1].trim());
  while ((m = phonePatternYP.exec(html)) !== null) phones.push(m[1].trim());
  while ((m = websitePattern.exec(html)) !== null) websites.push(m[1].trim());

  for (let i = 0; i < names.length; i++) {
    const addr = [addrs[i] || "", cities[i] || ""].filter(Boolean).join(", ");
    const website = websites[i] || "";
    results.push({
      name: names[i],
      address: addr,
      phone: phones[i] || "",
      rating: null,
      reviews: 0,
      website,
      webStatus: assessWebsite(website),
      mapsUrl: "",
    });
  }

  return results;
}

export async function POST(req: NextRequest) {
  const authed = await verifyManageAuth();
  if (!authed) return unauthorizedResponse();

  try {
    const { location } = await req.json();
    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const queries = ["coin shop", "coin dealer", "precious metals dealer", "gold silver dealer"];
    const allResults = new Map<string, Record<string, unknown>>();

    // Scrape from multiple sources in parallel
    const scrapeJobs = queries.flatMap((query) => [
      scrapeYellowPages(query, location).catch(() => []),
      scrapeYelp(query, location).catch(() => []),
    ]);

    const allScrapeResults = await Promise.all(scrapeJobs);

    for (const results of allScrapeResults) {
      for (const biz of results) {
        const name = String(biz.name || "").trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (!allResults.has(key)) {
          // Assess website if not already done
          if (!biz.webStatus) {
            biz.webStatus = assessWebsite(String(biz.website || ""));
          }
          allResults.set(key, biz);
        } else {
          // Merge: fill in missing data from other sources
          const existing = allResults.get(key)!;
          if (!existing.phone && biz.phone) existing.phone = biz.phone;
          if (!existing.address && biz.address) existing.address = biz.address;
          if (!existing.website && biz.website) {
            existing.website = biz.website;
            existing.webStatus = assessWebsite(String(biz.website));
          }
          if (!existing.rating && biz.rating) existing.rating = biz.rating;
        }
      }
    }

    const results = Array.from(allResults.values()).map((biz) => ({
      name: String(biz.name || ""),
      address: String(biz.address || ""),
      phone: String(biz.phone || ""),
      website: String(biz.website || ""),
      webStatus: String(biz.webStatus || "unknown"),
      rating: biz.rating as number | null,
      reviews: Number(biz.reviews || 0),
      mapsUrl: String(biz.mapsUrl || ""),
      businessStatus: "",
    }));

    // Sort: no website first
    const priority: Record<string, number> = {
      "NO WEBSITE": 0,
      "Facebook Only": 1,
      "Yelp Only": 1,
      "Yellow Pages Only": 1,
      "BBB Only": 1,
      "Has Website": 2,
    };
    results.sort((a, b) => (priority[a.webStatus] ?? 9) - (priority[b.webStatus] ?? 9));

    const noWebsite = results.filter((r) => r.webStatus === "NO WEBSITE").length;
    const socialOnly = results.filter((r) =>
      ["Facebook Only", "Yelp Only", "Yellow Pages Only", "BBB Only"].includes(r.webStatus)
    ).length;
    const hasWebsite = results.filter((r) => r.webStatus === "Has Website").length;

    return NextResponse.json({
      location,
      results,
      summary: {
        total: results.length,
        noWebsite,
        socialOnly,
        hasWebsite,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
