"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/spot-prices";
import { shopConfig } from "@/config/shop";

interface SpotPrices {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
}

const itemTypes = Object.keys(shopConfig.payoutEstimates);

function getMetalFromType(itemType: string): keyof SpotPrices {
  const lower = itemType.toLowerCase();
  if (lower.includes("gold")) return "gold";
  if (lower.includes("silver")) return "silver";
  if (lower.includes("platinum")) return "platinum";
  if (lower.includes("palladium")) return "palladium";
  return "gold";
}

export default function PayoutEstimator() {
  const [itemType, setItemType] = useState(itemTypes[0]);
  const [weight, setWeight] = useState<string>("1");
  const [spotPrices, setSpotPrices] = useState<SpotPrices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/spot-prices");
        if (res.ok) {
          const data = await res.json();
          setSpotPrices(data);
        }
      } catch {
        setSpotPrices({ gold: 2350, silver: 28.5, platinum: 985, palladium: 1050 });
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const metal = getMetalFromType(itemType);
  const spotPrice = spotPrices ? spotPrices[metal] : 0;
  const payout = shopConfig.payoutEstimates[itemType];
  const weightNum = parseFloat(weight) || 0;

  const minOffer = spotPrice * weightNum * (payout?.min || 0) / 100;
  const maxOffer = spotPrice * weightNum * (payout?.max || 0) / 100;

  const inputClasses = cn(
    "w-full px-4 py-3 rounded-lg border",
    "bg-white",
    "border-gray-200",
    "text-[#1B2A4A]",
    "focus:outline-none focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)]",
    "transition-all duration-300"
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-7 md:p-9 border border-[var(--border)]">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center">
          <span className="text-[#C9A84C] text-xl">&#128176;</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-[#1B2A4A]">
          Payout Estimator
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
        <div>
          <label
            htmlFor="item-type"
            className="block text-sm font-semibold text-[#1B2A4A] mb-1.5"
          >
            Item Type
          </label>
          <select
            id="item-type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className={inputClasses}
          >
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-semibold text-[#1B2A4A] mb-1.5"
          >
            Weight (troy oz)
          </label>
          <input
            id="weight"
            type="number"
            min="0"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6">
          <div className="animate-shimmer h-20 rounded-xl" />
        </div>
      ) : (
        <div className="bg-[var(--surface-alt)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Current {metal.charAt(0).toUpperCase() + metal.slice(1)} Spot Price:</span>
            <span className="font-bold text-[#1B2A4A] tabular-nums">{formatPrice(spotPrice)} /oz</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Payout Range:</span>
            <span className="font-bold text-[#1B2A4A]">
              {payout?.min}% &ndash; {payout?.max}%
            </span>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex justify-between items-center">
              <span className="text-[#1B2A4A] font-semibold">
                Estimated Offer:
              </span>
              <span className="text-2xl font-bold text-[#C9A84C] tabular-nums">
                {formatPrice(minOffer)} &ndash; {formatPrice(maxOffer)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            * Estimates are based on current spot prices and may vary. Final offers depend on item
            condition, rarity, and market demand. Visit us for an exact quote.
          </p>
        </div>
      )}
    </div>
  );
}
