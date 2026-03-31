"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { formatPrice } from "@/lib/spot-prices";
import { cn } from "@/lib/utils";
import type { CoinListing } from "@/components/CoinCard";

interface QuickViewModalProps {
  coin: CoinListing | null;
  onClose: () => void;
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

export default function QuickViewModal({ coin, onClose }: QuickViewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!coin) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [coin, onClose]);

  if (!coin) return null;

  const images = parseImages(coin.images);
  const primaryImage = images.length > 0 ? images[0] : null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2.5 text-gray-400 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-gray-600 hover:scale-110"
          aria-label="Close modal"
        >
          <FaTimes className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative aspect-square w-full flex-shrink-0 bg-gray-50 sm:w-1/2">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={coin.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <svg
                  className="h-20 w-20 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">$</text>
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col p-7">
            <h2 className="font-serif text-xl font-bold text-[#1B2A4A]">
              {coin.title}
            </h2>

            <div className="mt-4 space-y-2.5">
              {coin.year && (
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-[#1B2A4A]">Year:</span>{" "}
                  {coin.year}
                  {coin.mintMark ? ` (${coin.mintMark})` : ""}
                </p>
              )}

              {coin.grade && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-semibold text-[#1B2A4A]">Grade:</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      getGradeBadgeColor(coin.grade)
                    )}
                  >
                    {coin.grade}
                  </span>
                </p>
              )}

              {coin.certification && coin.certification !== "Raw" && (
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-[#1B2A4A]">Certification:</span>{" "}
                  {coin.certification}
                  {coin.certNumber ? ` #${coin.certNumber}` : ""}
                </p>
              )}

              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#1B2A4A]">Category:</span>{" "}
                {coin.category}
              </p>

              {coin.metal && (
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-[#1B2A4A]">Metal:</span>{" "}
                  {coin.metal}
                </p>
              )}
            </div>

            {coin.description && (
              <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-gray-500">
                {coin.description}
              </p>
            )}

            <div className="mt-auto pt-7">
              <p className="text-2xl font-bold text-[#C9A84C]">
                {formatPrice(coin.askingPrice)}
              </p>

              <Link
                href={`/inventory/${coin.slug}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1B2A4A] to-[#243558] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#1B2A4A]/25"
              >
                View Full Details
                <FaExternalLinkAlt className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
