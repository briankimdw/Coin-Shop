"use client";

import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
}

const emptyForm = { question: "", answer: "", sortOrder: 0, published: true };

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch all FAQs (including unpublished) for admin
    const fetchAll = async () => {
      setLoading(true);
      try {
        // The public endpoint only returns published, so we use a direct fetch
        // For admin, we fetch all by using the API
        const res = await fetch("/api/faq");
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch {
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/faq/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setFaqs((prev) =>
            prev
              .map((f) => (f.id === editingId ? updated : f))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          );
        }
      } else {
        const res = await fetch("/api/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setFaqs((prev) =>
            [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder)
          );
        }
      }
      resetForm();
    } catch {
      alert("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f: FAQ) => {
    setForm({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      published: f.published,
    });
    setEditingId(f.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete FAQ: "${question}"?`)) return;
    try {
      await fetch(`/api/faq/${id}`, { method: "DELETE" });
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Failed to delete FAQ");
    }
  };

  const togglePublished = async (f: FAQ) => {
    try {
      const res = await fetch(`/api/faq/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !f.published }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFaqs((prev) => prev.map((item) => (item.id === f.id ? updated : item)));
      }
    } catch {
      alert("Failed to update FAQ");
    }
  };

  const moveSortOrder = async (f: FAQ, direction: "up" | "down") => {
    const newOrder = direction === "up" ? f.sortOrder - 1 : f.sortOrder + 1;
    try {
      const res = await fetch(`/api/faq/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: newOrder }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFaqs((prev) =>
          prev
            .map((item) => (item.id === f.id ? updated : item))
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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">FAQ</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {faqs.length} questions
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium shadow-sm shadow-[#C9A84C]/25 text-sm"
        >
          <FaPlus className="text-xs" />
          {showForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="text-base font-bold text-[#1B2A4A]">
            {editingId ? "Edit FAQ" : "New FAQ"}
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              required
              rows={4}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm text-gray-700">Published</span>
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
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No FAQs yet. Add your first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div
              key={f.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      #{f.sortOrder}
                    </span>
                    <button
                      onClick={() => togglePublished(f)}
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        f.published
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                          : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                      }`}
                    >
                      {f.published ? "Published" : "Draft"}
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900">{f.question}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {f.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveSortOrder(f, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors disabled:opacity-30"
                    title="Move up"
                  >
                    <FaArrowUp className="text-sm" />
                  </button>
                  <button
                    onClick={() => moveSortOrder(f, "down")}
                    disabled={idx === faqs.length - 1}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors disabled:opacity-30"
                    title="Move down"
                  >
                    <FaArrowDown className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleEdit(f)}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, f.question)}
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
