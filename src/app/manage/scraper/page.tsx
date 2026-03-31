"use client";

import { useState } from "react";
import {
  FaSearch,
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaExternalLinkAlt,
  FaFileImport,
  FaCheckCircle,
} from "react-icons/fa";

interface ScrapedShop {
  name: string;
  address: string;
  phone: string;
  website: string;
  webStatus: string;
  rating: number | null;
  reviews: number;
  mapsUrl: string;
  businessStatus: string;
}

interface ScrapeResult {
  location: string;
  results: ScrapedShop[];
  summary: {
    total: number;
    noWebsite: number;
    socialOnly: number;
    hasWebsite: number;
  };
}

const webStatusColors: Record<string, string> = {
  "NO WEBSITE": "bg-red-100 text-red-700 border-red-200",
  "Facebook Only": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Yelp Only": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Yellow Pages Only": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "BBB Only": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Has Website": "bg-green-50 text-green-700 border-green-200",
};

const rowBgColors: Record<string, string> = {
  "NO WEBSITE": "bg-red-50/50",
  "Facebook Only": "bg-yellow-50/50",
  "Yelp Only": "bg-yellow-50/50",
  "Yellow Pages Only": "bg-yellow-50/50",
  "BBB Only": "bg-yellow-50/50",
  "Has Website": "",
};

export default function ScraperPage() {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("30000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/manage/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: location.trim(), radius: parseInt(radius) }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scrape failed");
        return;
      }

      setResult(data);

      // Pre-select shops without websites or with social-only
      const preSelected = new Set<number>();
      data.results.forEach((shop: ScrapedShop, i: number) => {
        if (shop.webStatus !== "Has Website") {
          preSelected.add(i);
        }
      });
      setSelected(preSelected);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
  };

  const toggleAll = () => {
    if (!result) return;
    if (selected.size === result.results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(result.results.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    if (!result || selected.size === 0) return;

    setImporting(true);
    setImportResult(null);

    const leads = Array.from(selected).map((i) => result.results[i]);

    try {
      const res = await fetch("/api/manage/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      const data = await res.json();
      setImportResult(data);
    } catch {
      setError("Failed to import leads");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Coin Shop Scraper</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-4">
          Search for coin shops near a location using Google Places API. Results are sorted by website status — shops without websites appear first.
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="text-xs text-gray-500 block mb-1">Location</label>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or ZIP code (e.g. Dallas, TX)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Radius</label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="10000">10 km (~6 mi)</option>
              <option value="30000">30 km (~18 mi)</option>
              <option value="50000">50 km (~31 mi)</option>
              <option value="100000">100 km (~62 mi)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {importResult && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <FaCheckCircle />
          Imported {importResult.imported} leads. {importResult.skipped > 0 && `${importResult.skipped} duplicates skipped.`}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm">
                  <strong>{result.summary.total}</strong> shops found near <strong>{result.location}</strong>
                </span>
                <span className="text-sm text-red-600 font-medium">
                  {result.summary.noWebsite} without website
                </span>
                <span className="text-sm text-yellow-600 font-medium">
                  {result.summary.socialOnly} social/directory only
                </span>
                <span className="text-sm text-green-600 font-medium">
                  {result.summary.hasWebsite} with website
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  {selected.size === result.results.length ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={handleImport}
                  disabled={selected.size === 0 || importing}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium"
                >
                  {importing ? <FaSpinner className="animate-spin" /> : <FaFileImport />}
                  Import Selected ({selected.size})
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === result.results.length}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Address</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Web Status</th>
                    <th className="px-4 py-3 text-left">Rating</th>
                    <th className="px-4 py-3 text-left w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((shop, i) => (
                    <tr
                      key={i}
                      className={`border-b hover:bg-gray-50 ${rowBgColors[shop.webStatus] || ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleSelect(i)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{shop.name}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{shop.address}</td>
                      <td className="px-4 py-3">
                        {shop.phone ? (
                          <a href={`tel:${shop.phone}`} className="text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            <FaPhone className="text-xs" /> {shop.phone}
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${webStatusColors[shop.webStatus] || "bg-gray-100 text-gray-600"}`}>
                          {shop.webStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {shop.rating ? `${shop.rating} (${shop.reviews})` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {shop.mapsUrl && (
                          <a
                            href={shop.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-teal-600"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
