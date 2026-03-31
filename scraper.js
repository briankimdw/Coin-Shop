#!/usr/bin/env node
/**
 * Coin Shop Contact Scraper
 *
 * Finds coin shops near a location using Google Places API
 * and exports their contact info to a CSV file.
 *
 * Usage:
 *   node scraper.js "Los Angeles, CA"
 *   node scraper.js "Los Angeles, CA" --radius=50000
 *   node scraper.js "90210"
 *
 * Set your Google API key:
 *   set GOOGLE_API_KEY=your_key_here   (Windows)
 *   export GOOGLE_API_KEY=your_key_here (Mac/Linux)
 *
 * Requires: Google Places API (New) enabled on your API key
 */

const fs = require("fs");
const https = require("https");

const API_KEY = process.env.GOOGLE_API_KEY;
const location = process.argv[2];
const radiusArg = process.argv.find((a) => a.startsWith("--radius="));
const radius = radiusArg ? parseInt(radiusArg.split("=")[1]) : 30000; // default 30km (~18 miles)

if (!API_KEY) {
  console.error("Error: Set GOOGLE_API_KEY environment variable first.");
  console.error("  Windows: set GOOGLE_API_KEY=your_key");
  console.error("  Mac/Linux: export GOOGLE_API_KEY=your_key");
  process.exit(1);
}

if (!location) {
  console.error("Usage: node scraper.js \"City, State\" [--radius=30000]");
  console.error("Example: node scraper.js \"Dallas, TX\" --radius=50000");
  process.exit(1);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
      res.on("error", reject);
    });
  });
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.businessStatus,places.types",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON: " + data.substring(0, 200)));
        }
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  const data = await fetch(url);
  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not geocode "${address}". Check the location.`);
  }
  const loc = data.results[0].geometry.location;
  console.log(`Location: ${data.results[0].formatted_address} (${loc.lat}, ${loc.lng})`);
  return loc;
}

async function searchNearby(lat, lng, radiusM) {
  const url = "https://places.googleapis.com/v1/places:searchNearby";
  const body = {
    includedTypes: ["store"],
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusM,
      },
    },
    maxResultCount: 20,
    languageCode: "en",
  };
  // Include keyword in text query instead
  const data = await postJson(url, body);
  return data.places || [];
}

async function textSearch(query, lat, lng, radiusM) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusM,
      },
    },
    maxResultCount: 20,
    languageCode: "en",
  };

  const urlObj = new URL(url);
  const postData = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.businessStatus,places.types",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.places || []);
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

function assessWebsite(url) {
  if (!url) return "NO WEBSITE";
  const lower = url.toLowerCase();
  if (lower.includes("facebook.com")) return "Facebook Only";
  if (lower.includes("yelp.com")) return "Yelp Only";
  if (lower.includes("yellowpages")) return "Yellow Pages Only";
  if (lower.includes("bbb.org")) return "BBB Only";
  return "Has Website";
}

function escapeCsv(val) {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function main() {
  console.log(`\nSearching for coin shops near "${location}" (radius: ${(radius / 1000).toFixed(0)}km / ${(radius / 1609).toFixed(0)}mi)...\n`);

  const { lat, lng } = await geocode(location);

  // Run multiple search queries to get broader results
  const queries = [
    "coin shop",
    "coin dealer",
    "coin store",
    "precious metals dealer",
    "gold silver dealer",
    "numismatic",
    "coin and bullion",
  ];

  const allPlaces = new Map();

  for (const query of queries) {
    process.stdout.write(`  Searching "${query}"...`);
    try {
      const places = await textSearch(query, lat, lng, radius);
      let newCount = 0;
      for (const place of places) {
        const name = place.displayName?.text || "Unknown";
        const addr = place.formattedAddress || "";
        const key = `${name}|${addr}`.toLowerCase();
        if (!allPlaces.has(key)) {
          allPlaces.set(key, place);
          newCount++;
        }
      }
      console.log(` ${places.length} results (${newCount} new)`);
    } catch (err) {
      console.log(` error: ${err.message}`);
    }
  }

  const shops = Array.from(allPlaces.values());
  console.log(`\nFound ${shops.length} unique shops total.\n`);

  if (shops.length === 0) {
    console.log("No results found. Check your API key and make sure Places API (New) is enabled.");
    return;
  }

  // Build results
  const results = shops.map((place) => {
    const name = place.displayName?.text || "Unknown";
    const address = place.formattedAddress || "";
    const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";
    const website = place.websiteUri || "";
    const mapsUrl = place.googleMapsUri || "";
    const rating = place.rating || "";
    const reviews = place.userRatingCount || 0;
    const status = place.businessStatus || "";
    const webStatus = assessWebsite(website);

    return { name, address, phone, website, mapsUrl, rating, reviews, status, webStatus };
  });

  // Sort: no website first, then facebook/yelp only, then has website
  const priority = { "NO WEBSITE": 0, "Facebook Only": 1, "Yelp Only": 1, "Yellow Pages Only": 1, "BBB Only": 1, "Has Website": 2 };
  results.sort((a, b) => (priority[a.webStatus] ?? 9) - (priority[b.webStatus] ?? 9));

  // Print summary
  const noSite = results.filter((r) => r.webStatus === "NO WEBSITE").length;
  const socialOnly = results.filter((r) => ["Facebook Only", "Yelp Only", "Yellow Pages Only", "BBB Only"].includes(r.webStatus)).length;
  const hasSite = results.filter((r) => r.webStatus === "Has Website").length;

  console.log("--- SUMMARY ---");
  console.log(`  No website:        ${noSite} shops  <-- HOT LEADS`);
  console.log(`  Social/directory:  ${socialOnly} shops  <-- WARM LEADS`);
  console.log(`  Has website:       ${hasSite} shops`);
  console.log("");

  // Print table
  console.log("--- TOP LEADS (No Website or Social Only) ---\n");
  const leads = results.filter((r) => r.webStatus !== "Has Website");
  if (leads.length === 0) {
    console.log("  All shops in this area have websites already!\n");
  } else {
    for (const shop of leads) {
      console.log(`  ${shop.name}`);
      console.log(`    Phone:   ${shop.phone || "N/A"}`);
      console.log(`    Address: ${shop.address}`);
      console.log(`    Web:     ${shop.webStatus}${shop.website ? " (" + shop.website + ")" : ""}`);
      console.log(`    Rating:  ${shop.rating || "N/A"} (${shop.reviews} reviews)`);
      console.log(`    Maps:    ${shop.mapsUrl}`);
      console.log("");
    }
  }

  // Save CSV
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeLoc = location.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `coin_shops_${safeLoc}_${timestamp}.csv`;

  const header = "Name,Address,Phone,Website,Web Status,Rating,Reviews,Google Maps,Business Status";
  const rows = results.map(
    (r) =>
      [r.name, r.address, r.phone, r.website, r.webStatus, r.rating, r.reviews, r.mapsUrl, r.status]
        .map(escapeCsv)
        .join(",")
  );

  const csv = [header, ...rows].join("\n");
  fs.writeFileSync(filename, csv, "utf-8");
  console.log(`Saved ${results.length} shops to ${filename}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
