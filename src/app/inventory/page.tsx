import type { Metadata } from "next";
import { Suspense } from "react";
import InventoryBrowser from "@/components/InventoryBrowser";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse our full inventory of rare coins, bullion, paper money, and collectibles. Filter by category, metal, grade, and price.",
};

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="page-hero py-14 md:py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Browse Our Selection</p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Our Inventory
          </h1>
          <p className="text-[#FAF7F0]/60 max-w-2xl mx-auto text-lg">
            Browse our current selection of coins, bullion, and collectibles
          </p>
        </div>
      </section>

      {/* Inventory Browser */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 rounded-lg w-full max-w-md mx-auto animate-shimmer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="aspect-square bg-gray-100 animate-shimmer" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-shimmer" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <InventoryBrowser />
      </Suspense>
    </div>
  );
}
