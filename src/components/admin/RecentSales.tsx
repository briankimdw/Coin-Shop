"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/spot-prices";

interface RecentSale {
  id: string;
  coinListingId: string;
  salePrice: number;
  soldAt: string;
  coinListing: {
    title: string;
    category: string;
    images: string;
  };
}

interface RecentSalesProps {
  sales: RecentSale[];
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseImages(imagesStr: string): string[] {
  try {
    return JSON.parse(imagesStr);
  } catch {
    return [];
  }
}

export default function RecentSales({ sales }: RecentSalesProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        No sales recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sales.map((sale) => {
        const images = parseImages(sale.coinListing.images);
        return (
          <Link
            key={sale.id}
            href={`/admin/inventory/${sale.coinListingId}/edit`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">🪙</span>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#C9A84C] transition-colors">
                {sale.coinListing.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-500">
                  {sale.coinListing.category}
                </span>
                <span className="text-[10px] text-gray-400">
                  {getRelativeTime(sale.soldAt)}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-900">
                {formatPrice(sale.salePrice)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
