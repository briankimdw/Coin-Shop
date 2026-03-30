"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { shopConfig } from "@/config/shop";
import { cn } from "@/lib/utils";
import CoinCard from "@/components/CoinCard";
import QuickViewModal from "@/components/QuickViewModal";
import type { CoinListing } from "@/components/CoinCard";

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const sortOptions = [
  { value: "date-desc", label: "Newest Listed" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-asc", label: "Year: Old to New" },
  { value: "year-desc", label: "Year: New to Old" },
  { value: "grade", label: "Grade" },
];

export default function InventoryBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? cat.split(",") : [];
  });
  const [selectedMetals, setSelectedMetals] = useState<string[]>(() => {
    const met = searchParams.get("metal");
    return met ? met.split(",") : [];
  });
  const [grade, setGrade] = useState(searchParams.get("grade") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "");
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "date-desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Data state
  const [listings, setListings] = useState<CoinListing[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewCoin, setQuickViewCoin] = useState<CoinListing | null>(null);

  // Build query params and fetch
  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (selectedCategories.length === 1) params.set("category", selectedCategories[0]);
    if (selectedMetals.length === 1) params.set("metal", selectedMetals[0]);
    if (grade) params.set("grade", grade);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minYear) params.set("minYear", minYear);
    if (maxYear) params.set("maxYear", maxYear);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
      setPagination(
        data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      );
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategories, selectedMetals, grade, minPrice, maxPrice, minYear, maxYear, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    if (selectedMetals.length > 0) params.set("metal", selectedMetals.join(","));
    if (grade) params.set("grade", grade);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minYear) params.set("minYear", minYear);
    if (maxYear) params.set("maxYear", maxYear);
    if (sort !== "date-desc") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    router.replace(`/inventory${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [search, selectedCategories, selectedMetals, grade, minPrice, maxPrice, minYear, maxYear, sort, page, router]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const toggleMetal = (met: string) => {
    setSelectedMetals((prev) =>
      prev.includes(met) ? prev.filter((m) => m !== met) : [...prev, met]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedMetals([]);
    setGrade("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setSort("date-desc");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedMetals.length > 0 ||
    grade ||
    minPrice ||
    maxPrice ||
    minYear ||
    maxYear;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-5 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );

  // Sidebar filter content (shared between desktop sidebar and mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-gray-900">
          Category
        </h3>
        <div className="space-y-2">
          {shopConfig.categories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Metals */}
      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-gray-900">
          Metal
        </h3>
        <div className="space-y-2">
          {shopConfig.metals.filter((m) => ["Gold", "Silver", "Copper", "Platinum"].includes(m)).map((met) => (
            <label key={met} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMetals.includes(met)}
                onChange={() => toggleMetal(met)}
                className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
              />
              <span className="text-sm text-gray-700">{met}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-gray-900">
          Grade
        </h3>
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
        >
          <option value="">All Grades</option>
          {shopConfig.grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-gray-900">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            min="0"
          />
          <span className="text-gray-400">&ndash;</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            min="0"
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-gray-900">
          Year Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minYear}
            onChange={(e) => {
              setMinYear(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          />
          <span className="text-gray-400">&ndash;</span>
          <input
            type="number"
            placeholder="Max"
            value={maxYear}
            onChange={(e) => {
              setMaxYear(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coins, bullion, currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Sort & Filter Controls (top bar) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {loading ? (
            <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-200" />
          ) : (
            <>
              <span className="font-semibold text-gray-900">
                {pagination.total}
              </span>{" "}
              {pagination.total === 1 ? "result" : "results"} found
            </>
          )}
        </p>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
          >
            <FaFilter className="h-3 w-3" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-[#C9A84C] px-1.5 py-0.5 text-xs text-white">
                !
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-serif text-lg font-bold text-gray-900">
              Filters
            </h2>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 top-0 w-80 overflow-y-auto bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Filters
                </h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-20">
              <svg
                className="mb-4 h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-500">
                No coins found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b8973f]"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((coin) => (
                  <CoinCard
                    key={coin.id}
                    coin={coin}
                    onQuickView={setQuickViewCoin}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      page <= 1
                        ? "cursor-not-allowed border-gray-200 text-gray-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <FaChevronLeft className="h-3 w-3" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (pagination.totalPages <= 7) return true;
                        if (p === 1 || p === pagination.totalPages) return true;
                        if (Math.abs(p - page) <= 1) return true;
                        return false;
                      })
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) {
                          acc.push("...");
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        typeof p === "string" ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="px-2 text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              page === p
                                ? "bg-[#1B2A4A] text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page >= pagination.totalPages}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      page >= pagination.totalPages
                        ? "cursor-not-allowed border-gray-200 text-gray-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    Next
                    <FaChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal coin={quickViewCoin} onClose={() => setQuickViewCoin(null)} />
    </div>
  );
}
