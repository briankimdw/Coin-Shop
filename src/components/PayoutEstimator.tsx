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
        // Use fallback
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
      <h3 className="text-xl font-serif font-bold text-[#1B2A4A] mb-6">
        Payout Estimator
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div>
          <label
            htmlFor="item-type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Item Type
          </label>
          <select
            id="item-type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className={cn(
              "w-full px-4 py-3 rounded-lg border",
              "bg-white",
              "border-gray-300",
              "text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            )}
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
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className={cn(
              "w-full px-4 py-3 rounded-lg border",
              "bg-white",
              "border-gray-300",
              "text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            )}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">
          Loading spot prices...
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current {metal.charAt(0).toUpperCase() + metal.slice(1)} Spot Price:</span>
            <span className="font-semibold">{formatPrice(spotPrice)} /oz</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Payout Range:</span>
            <span className="font-semibold">
              {payout?.min}% &ndash; {payout?.max}%
            </span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">
              Estimated Offer:
            </span>
            <span className="text-xl font-bold text-[#C9A84C]">
              {formatPrice(minOffer)} &ndash; {formatPrice(maxOffer)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Estimates are based on current spot prices and may vary. Final offers depend on item
            condition, rarity, and market demand. Visit us for an exact quote.
          </p>
        </div>
      )}
    </div>
  );
}
