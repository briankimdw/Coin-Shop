"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/spot-prices";
import { cn } from "@/lib/utils";
import { FaSearch } from "react-icons/fa";

export interface CoinListing {
  id: string;
  title: string;
  slug: string;
  category: string;
  metal?: string | null;
  year?: number | null;
  mintMark?: string | null;
  grade?: string | null;
  certification?: string | null;
  certNumber?: string | null;
  description?: string | null;
  askingPrice: number;
  quantity: number;
  featured: boolean;
  sold: boolean;
  images: string;
  createdAt: string;
}

interface CoinCardProps {
  coin: CoinListing;
  onQuickView: (coin: CoinListing) => void;
}

function getGradeBadgeColor(grade: string | null | undefined): string {
  if (!grade) return "bg-gray-100 text-gray-600";
  if (grade.startsWith("MS-7") || grade.startsWith("PF-7"))
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (grade.startsWith("MS-6") || grade.startsWith("PF-6"))
    return "bg-blue-50 text-blue-700 border border-blue-200";
  if (grade.startsWith("AU") || grade.startsWith("EF"))
    return "bg-amber-50 text-amber-700 border border-amber-200";
  if (grade.startsWith("VF") || grade.startsWith("F-"))
    return "bg-orange-50 text-orange-700 border border-orange-200";
  return "bg-gray-100 text-gray-600";
}

function parseImages(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson);
  } catch {
    return [];
  }
}

export default function CoinCard({ coin, onQuickView }: CoinCardProps) {
  const images = parseImages(coin.images);
  const primaryImage = images.length > 0 ? images[0] : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/8 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/inventory/${coin.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={coin.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                stroke="none"
              >
                $
              </text>
            </svg>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(coin);
          }}
          className="absolute bottom-3 right-3 rounded-full bg-white/95 p-2.5 text-gray-600 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#C9A84C] hover:scale-110 group-hover:opacity-100"
          aria-label="Quick view"
        >
          <FaSearch className="h-3.5 w-3.5" />
        </button>

        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-[#1B2A4A]/90 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
          {coin.category}
        </span>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={`/inventory/${coin.slug}`}>
          <h3 className="font-serif text-sm font-bold leading-snug text-[#1B2A4A] transition-colors duration-300 hover:text-[#C9A84C] sm:text-[15px] line-clamp-2">
            {coin.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          {coin.year && (
            <span className="font-medium">
              {coin.year}
              {coin.mintMark ? `-${coin.mintMark}` : ""}
            </span>
          )}
          {coin.grade && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                getGradeBadgeColor(coin.grade)
              )}
            >
              {coin.grade}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <p className="text-lg font-bold text-[#C9A84C]">
            {formatPrice(coin.askingPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
