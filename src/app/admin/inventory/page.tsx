"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileExport,
  FaFileImport,
  FaStar,
  FaSearch,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaChevronLeft,
  FaChevronRight,
  FaCamera,
} from "react-icons/fa";
import { formatPrice } from "@/lib/spot-prices";
import RecordSaleModal from "@/components/admin/RecordSaleModal";
import QuickAddModal from "@/components/admin/QuickAddModal";

interface InventoryItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  metal: string | null;
  grade: string | null;
  askingPrice: number;
  quantity: number;
  featured: boolean;
  sold: boolean;
  images: string; // JSON string
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [importing, setImporting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleModalItem, setSaleModalItem] = useState<{
    id: string;
    title: string;
    askingPrice: number;
    images: string;
  } | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      setItems(data.listings || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const parseImages = (imagesStr: string): string[] => {
    try {
      return JSON.parse(imagesStr);
    } catch {
      return [];
    }
  };

  const handleToggle = async (
    id: string,
    field: "featured" | "sold",
    current: boolean
  ) => {
    // When toggling from available -> sold, open the sale modal instead
    if (field === "sold" && !current) {
      const item = items.find((i) => i.id === id);
      if (item) {
        setSaleModalItem({
          id: item.id,
          title: item.title,
          askingPrice: item.askingPrice,
          images: item.images,
        });
        setSaleModalOpen(true);
      }
      return;
    }

    setTogglingId(id);
    try {
      await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !current }),
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: !current } : item
        )
      );
    } catch {
      // handle error
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      // handle error
    }
  };

  const handleExport = () => {
    window.open("/api/inventory/export", "_blank");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/inventory/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully imported ${data.count || 0} items!`);
        fetchItems();
      }
    } catch {
      alert("Import failed. Check your CSV format.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Mobile card for each item
  const MobileCard = ({ item }: { item: InventoryItem }) => {
    const images = parseImages(item.images);
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
            {images[0] ? (
              <img src={images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🪙</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                {item.category}
              </span>
              {item.metal && (
                <span className="text-xs text-gray-400">{item.metal}</span>
              )}
              {item.grade && (
                <span className="text-xs text-gray-400">{item.grade}</span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900">
              {formatPrice(item.askingPrice)}
            </p>
            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleToggle(item.id, "featured", item.featured)}
              disabled={togglingId === item.id}
              className="flex items-center gap-1.5 text-sm disabled:opacity-50"
            >
              <FaStar className={item.featured ? "text-[#C9A84C]" : "text-gray-300"} />
              <span className={`text-xs ${item.featured ? "text-[#C9A84C]" : "text-gray-400"}`}>
                {item.featured ? "Featured" : "Feature"}
              </span>
            </button>
            <button
              onClick={() => handleToggle(item.id, "sold", item.sold)}
              disabled={togglingId === item.id}
              className="flex items-center gap-1.5 text-sm disabled:opacity-50"
            >
              {item.sold ? (
                <FaToggleOn className="text-green-500 text-lg" />
              ) : (
                <FaToggleOff className="text-gray-300 text-lg" />
              )}
              <span className={`text-xs ${item.sold ? "text-green-500" : "text-gray-400"}`}>
                {item.sold ? "Sold" : "Available"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/inventory/${item.id}/edit`}
              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => handleDelete(item.id, item.title)}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            Inventory
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} total items
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
          >
            <FaFileExport className="text-xs" /> Export
          </button>
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm cursor-pointer">
            {importing ? <FaSpinner className="animate-spin text-xs" /> : <FaFileImport className="text-xs" />}
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white rounded-lg transition-all font-medium text-sm"
          >
            <FaCamera className="text-xs" /> Quick Add
          </button>
          <Link
            href="/admin/inventory/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium shadow-sm shadow-[#C9A84C]/25 text-sm"
          >
            <FaPlus className="text-xs" /> Add New
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Mobile Cards (shown on small screens) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <FaSearch className="text-3xl mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No items found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try a different search term" : "Add your first listing"}
            </p>
          </div>
        ) : (
          items.map((item) => <MobileCard key={item.id} item={item} />)
        )}
      </div>

      {/* Desktop Table (hidden on small screens) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200/80">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Metal
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Grade
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Featured
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Sold
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="text-gray-400">
                      <FaSearch className="text-4xl mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No items found</p>
                      <p className="text-sm mt-1">
                        {search ? "Try a different search term" : "Add your first listing to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const images = parseImages(item.images);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            {images[0] ? (
                              <img src={images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg">🪙</span>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="inline-flex px-2 py-1 rounded-md bg-gray-100 text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {item.metal || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {item.grade || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatPrice(item.askingPrice)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(item.id, "featured", item.featured)}
                          disabled={togglingId === item.id}
                          className="text-xl transition-all hover:scale-110 disabled:opacity-50"
                          title={item.featured ? "Remove from featured" : "Add to featured"}
                        >
                          <FaStar className={item.featured ? "text-[#C9A84C]" : "text-gray-300"} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(item.id, "sold", item.sold)}
                          disabled={togglingId === item.id}
                          className="text-xl transition-all hover:scale-110 disabled:opacity-50"
                          title={item.sold ? "Mark as available" : "Mark as sold"}
                        >
                          {item.sold ? (
                            <FaToggleOn className="text-green-500" />
                          ) : (
                            <FaToggleOff className="text-gray-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/inventory/${item.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-lg bg-white border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-lg bg-white border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => {
          fetchItems();
        }}
      />

      {/* Record Sale Modal */}
      <RecordSaleModal
        isOpen={saleModalOpen}
        onClose={() => {
          setSaleModalOpen(false);
          setSaleModalItem(null);
        }}
        onSaleRecorded={() => {
          fetchItems();
        }}
        preselectedItem={saleModalItem || undefined}
      />
    </div>
  );
}
