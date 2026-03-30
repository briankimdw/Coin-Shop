"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaSpinner, FaTimes } from "react-icons/fa";
import { formatPrice } from "@/lib/spot-prices";

interface InventoryItem {
  id: string;
  title: string;
  askingPrice: number;
  images: string;
  category?: string;
  metal?: string | null;
  grade?: string | null;
}

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleRecorded: () => void;
  preselectedItem?: {
    id: string;
    title: string;
    askingPrice: number;
    images: string;
  };
}

export default function RecordSaleModal({
  isOpen,
  onClose,
  onSaleRecorded,
  preselectedItem,
}: RecordSaleModalProps) {
  const [step, setStep] = useState<"search" | "confirm">(
    preselectedItem ? "confirm" : "search"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
    preselectedItem || null
  );
  const [salePrice, setSalePrice] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal opens/closes or preselectedItem changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedItem) {
        setSelectedItem(preselectedItem);
        setSalePrice(preselectedItem.askingPrice.toString());
        setStep("confirm");
      } else {
        setSelectedItem(null);
        setSalePrice("");
        setStep("search");
      }
      setSaleDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setError("");
      setSearchTerm("");
      setSearchResults([]);
    }
  }, [isOpen, preselectedItem]);

  const searchInventory = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({
        search: term,
        limit: "10",
      });
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      // Filter to only unsold items
      const unsold = (data.listings || []).filter(
        (item: InventoryItem & { sold?: boolean }) => !item.sold
      );
      setSearchResults(unsold);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (step !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchInventory(searchTerm);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, step, searchInventory]);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setSalePrice(item.askingPrice.toString());
    setStep("confirm");
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;

    const price = parseFloat(salePrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid sale price.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinListingId: selectedItem.id,
          salePrice: price,
          soldAt: saleDate
            ? new Date(saleDate + "T12:00:00").toISOString()
            : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record sale");
      }

      onSaleRecorded();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to record sale"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const parseImages = (imagesStr: string): string[] => {
    try {
      return JSON.parse(imagesStr);
    } catch {
      return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-serif font-bold text-[#1B2A4A]">
            Record Sale
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Search */}
          {step === "search" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Unsold Inventory
              </label>
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type to search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] outline-none transition-all text-sm"
                />
              </div>

              {searching && (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <FaSpinner className="animate-spin mr-2" />
                  Searching...
                </div>
              )}

              {!searching && searchTerm && searchResults.length === 0 && (
                <p className="text-center py-8 text-gray-400 text-sm">
                  No unsold items found matching your search.
                </p>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {searchResults.map((item) => {
                    const images = parseImages(item.images);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                          {images[0] ? (
                            <img
                              src={images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">&#x1FA99;</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Asking: {formatPrice(item.askingPrice)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!searching && !searchTerm && (
                <p className="text-center py-8 text-gray-400 text-sm">
                  Start typing to search your unsold inventory.
                </p>
              )}
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === "confirm" && selectedItem && (
            <div className="space-y-5">
              {/* Selected item display */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {parseImages(selectedItem.images)[0] ? (
                    <img
                      src={parseImages(selectedItem.images)[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">&#x1FA99;</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {selectedItem.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Asking: {formatPrice(selectedItem.askingPrice)}
                  </p>
                </div>
                {!preselectedItem && (
                  <button
                    onClick={() => {
                      setStep("search");
                      setSelectedItem(null);
                    }}
                    className="text-xs text-[#C9A84C] hover:underline flex-shrink-0"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Sale price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] outline-none transition-all text-sm"
                  placeholder="0.00"
                />
              </div>

              {/* Sale date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] outline-none transition-all text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] outline-none transition-all text-sm resize-none"
                  placeholder="e.g. Sold at coin show, buyer info..."
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  Record Sale
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
