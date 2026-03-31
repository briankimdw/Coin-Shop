import { NextRequest, NextResponse } from "next/server";
import { verifyManageAuth, unauthorizedResponse } from "@/lib/manage-auth";

const API_KEY = process.env.GOOGLE_API_KEY || "";

function assessWebsite(url: string): string {
  if (!url) return "NO WEBSITE";
  const lower = url.toLowerCase();
  if (lower.includes("facebook.com")) return "Facebook Only";
  if (lower.includes("yelp.com")) return "Yelp Only";
  if (lower.includes("yellowpages")) return "Yellow Pages Only";
  if (lower.includes("bbb.org")) return "BBB Only";
  return "Has Website";
}

async function geocode(address: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not geocode "${address}"`);
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address };
}

async function textSearch(query: string, lat: number, lng: number, radius: number) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.businessStatus",
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius,
        },
      },
      maxResultCount: 20,
      languageCode: "en",
    }),
  });
  const data = await res.json();
  return data.places || [];
}

export async function POST(req: NextRequest) {
  
  const authed = await verifyManageAuth(); if (!authed) return unauthorizedResponse();

  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_API_KEY not configured. Add it to your .env file." },
      { status: 400 }
    );
  }

  try {
    const { location, radius = 30000 } = await req.json();
    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const geo = await geocode(location);

    const queries = [
      "coin shop",
      "coin dealer",
      "coin store",
      "precious metals dealer",
      "gold silver dealer",
      "numismatic",
      "coin and bullion",
    ];

    const allPlaces = new Map<string, Record<string, unknown>>();

    for (const query of queries) {
      try {
        const places = await textSearch(query, geo.lat, geo.lng, radius);
        for (const place of places) {
          const name = place.displayName?.text || "Unknown";
          const addr = place.formattedAddress || "";
          const key = `${name}|${addr}`.toLowerCase();
          if (!allPlaces.has(key)) {
            allPlaces.set(key, place);
          }
        }
      } catch {
        // Skip failed queries
      }
    }

    const results = Array.from(allPlaces.values()).map((place) => {
      const website = (place.websiteUri as string) || "";
      return {
        name: (place.displayName as { text: string })?.text || "Unknown",
        address: (place.formattedAddress as string) || "",
        phone: (place.nationalPhoneNumber as string) || (place.internationalPhoneNumber as string) || "",
        website,
        webStatus: assessWebsite(website),
        rating: (place.rating as number) || null,
        reviews: (place.userRatingCount as number) || 0,
        mapsUrl: (place.googleMapsUri as string) || "",
        businessStatus: (place.businessStatus as string) || "",
      };
    });

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
      location: geo.formatted,
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
