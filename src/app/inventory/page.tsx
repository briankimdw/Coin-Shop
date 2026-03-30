import type { Metadata } from "next";
import { Suspense } from "react";
import InventoryBrowser from "@/components/InventoryBrowser";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse our full inventory of rare coins, bullion, paper money, and collectibles. Filter by category, metal, grade, and price.",
};

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="bg-[#1B2A4A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Our Inventory
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Browse our current selection of coins, bullion, and collectibles
          </p>
        </div>
      </section>

      {/* Inventory Browser */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full max-w-md mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg" />
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
