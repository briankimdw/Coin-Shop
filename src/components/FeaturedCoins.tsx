"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/spot-prices";

interface Coin {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  grade: string | null;
  askingPrice: number;
  images: string;
}

export default function FeaturedCoins() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch("/api/inventory?featured=true&limit=8");
        if (res.ok) {
          const data = await res.json();
          setCoins(data.listings || data.items || data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchCoins();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-4 animate-pulse"
          >
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Check back soon for featured coins!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {coins.map((coin) => {
        const images = (() => {
          try {
            return JSON.parse(coin.images);
          } catch {
            return [];
          }
        })();
        const hasImage = images.length > 0;

        return (
          <Link
            key={coin.id}
            href={`/inventory/${coin.slug}`}
            className={cn(
              "group bg-white rounded-xl shadow-md",
              "border border-gray-100",
              "hover:shadow-xl hover:border-[#C9A84C]/50 transition-all duration-300",
              "overflow-hidden"
            )}
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
              {hasImage ? (
                <img
                  src={images[0]}
                  alt={coin.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-6xl" role="img" aria-label="coin">
                  🪙
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#1B2A4A] group-hover:text-[#C9A84C] transition-colors line-clamp-2 mb-1">
                {coin.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                {coin.year && <span>{coin.year}</span>}
                {coin.year && coin.grade && <span>&middot;</span>}
                {coin.grade && <span>{coin.grade}</span>}
              </div>
              <p className="text-lg font-bold text-[#C9A84C]">
                {formatPrice(coin.askingPrice)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
