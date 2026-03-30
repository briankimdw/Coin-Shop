"use client";

import Link from "next/link";
import Image from "next/image";
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
  if (!grade) return "bg-gray-200 text-gray-700";
  if (grade.startsWith("MS-7") || grade.startsWith("PF-7"))
    return "bg-emerald-100 text-emerald-800";
  if (grade.startsWith("MS-6") || grade.startsWith("PF-6"))
    return "bg-blue-100 text-blue-800";
  if (grade.startsWith("AU") || grade.startsWith("EF"))
    return "bg-amber-100 text-amber-800";
  if (grade.startsWith("VF") || grade.startsWith("F-"))
    return "bg-orange-100 text-orange-800";
  return "bg-gray-200 text-gray-700";
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
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/inventory/${coin.slug}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={coin.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
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

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(coin);
          }}
          className="absolute bottom-2 right-2 rounded-full bg-white/90 p-2 text-gray-700 opacity-0 shadow-md transition-opacity hover:bg-white group-hover:opacity-100"
          aria-label="Quick view"
        >
          <FaSearch className="h-4 w-4" />
        </button>

        {/* Category Badge */}
        <span className="absolute left-2 top-2 rounded-full bg-[#1B2A4A]/90 px-2.5 py-0.5 text-xs font-medium text-white">
          {coin.category}
        </span>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/inventory/${coin.slug}`}>
          <h3 className="font-serif text-sm font-semibold leading-tight text-gray-900 transition-colors hover:text-[#C9A84C] sm:text-base">
            {coin.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
          {coin.year && (
            <span>
              {coin.year}
              {coin.mintMark ? `-${coin.mintMark}` : ""}
            </span>
          )}
          {coin.grade && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                getGradeBadgeColor(coin.grade)
              )}
            >
              {coin.grade}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-[#C9A84C]">
            {formatPrice(coin.askingPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
