"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotPrice {
  metal: string;
  price: number;
  change?: number;
}

interface SpotPriceResponse {
  prices: SpotPrice[];
  timestamp: string;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const fallbackPrices: SpotPrice[] = [
  { metal: "Gold", price: 0, change: 0 },
  { metal: "Silver", price: 0, change: 0 },
  { metal: "Platinum", price: 0, change: 0 },
  { metal: "Palladium", price: 0, change: 0 },
];

const metalIcons: Record<string, string> = {
  Gold: "Au",
  Silver: "Ag",
  Platinum: "Pt",
  Palladium: "Pd",
};

export default function SpotPriceBar() {
  const [prices, setPrices] = useState<SpotPrice[]>(fallbackPrices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/spot-prices", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: SpotPriceResponse = await res.json();
      setPrices(data.prices);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatPrice = (price: number): string => {
    if (price === 0) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change?: number): string => {
    if (change === undefined || change === 0) return "";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}`;
  };

  return (
    <div className="spot-price-bar w-full bg-gradient-to-r from-[#B8942E] via-[#C9A84C] to-[#B8942E] text-[#1B2A4A] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2.5 sm:py-2">
          <span className="font-serif font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] flex-shrink-0 mr-4 sm:mr-6 opacity-80">
            Live Spot Prices
          </span>
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-4 sm:gap-8 min-w-0">
              {loading ? (
                <span className="text-[#1B2A4A]/60 text-xs whitespace-nowrap">Loading prices...</span>
              ) : error ? (
                <span className="text-[#1B2A4A]/60 text-xs whitespace-nowrap">Prices unavailable</span>
              ) : (
                prices.map((item) => (
                  <div
                    key={item.metal}
                    className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="hidden sm:inline-block text-[10px] font-bold opacity-50 bg-[#1B2A4A]/10 rounded px-1 py-0.5">
                      {metalIcons[item.metal] || item.metal[0]}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm">{item.metal}:</span>
                    <span className="text-xs sm:text-sm font-bold tabular-nums">{formatPrice(item.price)}</span>
                    {item.change !== undefined && item.change !== 0 && (
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-semibold rounded-full px-1.5 py-0.5",
                          item.change > 0
                            ? "text-green-900 bg-green-200/40"
                            : "text-red-900 bg-red-200/40"
                        )}
                      >
                        {formatChange(item.change)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
