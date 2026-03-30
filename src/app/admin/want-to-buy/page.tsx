"use client";

import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaFire,
} from "react-icons/fa";

interface WantToBuyItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priceRange: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

const CATEGORIES = [
  "Gold Coins",
  "Silver Coins",
  "Bullion",
  "Paper Money",
  "Jewelry",
  "Collections",
  "Other",
];

const emptyForm = {
  title: "",
  description: "",
  category: "Gold Coins",
  priceRange: "",
  featured: false,
  active: true,
  sortOrder: 0,
};

export default function WantToBuyAdminPage() {
  const [items, setItems] = useState<WantToBuyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/want-to-buy?all=true");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/want-to-buy/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) =>
            prev
              .map((item) => (item.id === editingId ? updated : item))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          );
        }
      } else {
        const res = await fetch("/api/want-to-buy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) =>
            [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder)
          );
        }
      }
      resetForm();
    } catch {
      alert("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: WantToBuyItem) => {
    setForm({
      title: item.title,
      description: item.description || "",
      category: item.category,
      priceRange: item.priceRange || "",
      featured: item.featured,
      active: item.active,
      sortOrder: item.sortOrder,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await fetch(`/api/want-to-buy/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("Failed to delete item");
    }
  };

  const toggleActive = async (item: WantToBuyItem) => {
    try {
      const res = await fetch(`/api/want-to-buy/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? updated : i))
        );
      }
    } catch {
      alert("Failed to update item");
    }
  };

  const toggleFeatured = async (item: WantToBuyItem) => {
    try {
      const res = await fetch(`/api/want-to-buy/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? updated : i))
        );
      }
    } catch {
      alert("Failed to update item");
    }
  };

  const moveSortOrder = async (item: WantToBuyItem, direction: "up" | "down") => {
    const newOrder = direction === "up" ? item.sortOrder - 1 : item.sortOrder + 1;
    try {
      const res = await fetch(`/api/want-to-buy/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: newOrder }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) =>
          prev
            .map((i) => (i.id === item.id ? updated : i))
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }
    } catch {
      alert("Failed to update sort order");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Want to Buy
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} items &middot; {items.filter((i) => i.active).length}{" "}
            active
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
        >
          <FaPlus className="text-sm" />
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="font-serif text-lg font-bold text-gray-900">
            {editingId ? "Edit Item" : "New Item"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 1909-S VDB Lincoln Cent"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Details about what you're looking for, condition requirements, etc."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <input
                type="text"
                value={form.priceRange}
                onChange={(e) =>
                  setForm({ ...form, priceRange: e.target.value })
                }
                placeholder="e.g. $500 - $2,000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No items yet. Add coins and items you&apos;re looking to buy.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border p-5 ${
                item.active
                  ? "border-gray-200"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">
                      #{item.sortOrder}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {item.category}
                    </span>
                    <button
                      onClick={() => toggleActive(item)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </button>
                    {item.featured && (
                      <button
                        onClick={() => toggleFeatured(item)}
                        className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium flex items-center gap-1"
                      >
                        <FaFire className="text-[10px]" /> Hot
                      </button>
                    )}
                    {!item.featured && (
                      <button
                        onClick={() => toggleFeatured(item)}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 font-medium"
                        title="Click to feature"
                      >
                        Not Featured
                      </button>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.priceRange && (
                    <p className="text-sm text-[#C9A84C] font-medium mt-1">
                      Offering: {item.priceRange}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveSortOrder(item, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors disabled:opacity-30"
                    title="Move up"
                  >
                    <FaArrowUp className="text-sm" />
                  </button>
                  <button
                    onClick={() => moveSortOrder(item, "down")}
                    disabled={idx === items.length - 1}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors disabled:opacity-30"
                    title="Move down"
                  >
                    <FaArrowDown className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
