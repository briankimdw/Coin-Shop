"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaStar, FaGoogle, FaTimes } from "react-icons/fa";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

const emptyForm = { name: "", text: "", rating: 5, featured: true };

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleReviews, setGoogleReviews] = useState<
    { authorName: string; rating: number; text: string; time: number; relativeTime: string; imported?: boolean }[]
  >([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const fetchGoogleReviews = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await fetch("/api/admin/google-reviews");
      const data = await res.json();
      if (!res.ok) {
        setGoogleError(data.error || "Failed to fetch reviews");
        return;
      }
      setGoogleReviews(data.map((r: { authorName: string; rating: number; text: string; time: number; relativeTime: string }) => ({ ...r, imported: false })));
      setShowGoogleModal(true);
    } catch {
      setGoogleError("Failed to fetch Google reviews");
    } finally {
      setGoogleLoading(false);
    }
  };

  const importGoogleReview = async (review: { authorName: string; rating: number; text: string }, index: number) => {
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: review.authorName,
          text: review.text,
          rating: review.rating,
          featured: false,
        }),
      });
      if (res.ok) {
        setGoogleReviews((prev) =>
          prev.map((r, i) => (i === index ? { ...r, imported: true } : r))
        );
        await fetchTestimonials();
      }
    } catch {
      alert("Failed to import review");
    }
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials?all=true");
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/testimonials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setTestimonials((prev) =>
            prev.map((t) => (t.id === editingId ? updated : t))
          );
        }
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          await fetchTestimonials();
        }
      }
      resetForm();
    } catch {
      alert("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: Testimonial) => {
    setForm({ name: t.name, text: t.text, rating: t.rating, featured: t.featured });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete testimonial");
    }
  };

  const toggleFeatured = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !t.featured }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonials((prev) =>
          prev.map((item) => (item.id === t.id ? updated : item))
        );
      }
    } catch {
      alert("Failed to update testimonial");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-[#C9A84C]" : "text-gray-300"}
      />
    ));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Testimonials
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {testimonials.length} testimonials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGoogleReviews}
            disabled={googleLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all font-medium text-sm disabled:opacity-50"
          >
            <FaGoogle className="text-sm" />
            {googleLoading ? "Loading..." : "Import from Google"}
          </button>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
          >
            <FaPlus className="text-sm" />
            {showForm ? "Cancel" : "Add Testimonial"}
          </button>
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="font-serif text-lg font-bold text-gray-900">
            {editingId ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <select
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Testimonial Text
            </label>
            <textarea
              required
              rows={3}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">
              Featured on homepage
            </label>
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
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No testimonials yet. Add your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <div className="flex gap-0.5 mt-1">{renderStars(t.rating)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(t)}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.featured
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    title={t.featured ? "Click to unfeature" : "Click to feature"}
                  >
                    {t.featured ? "Featured" : "Hidden"}
                  </button>
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{t.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Google Error */}
      {googleError && !showGoogleModal && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          <span>{googleError}</span>
          <button onClick={() => setGoogleError(null)} className="text-red-400 hover:text-red-600">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Google Reviews Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Google Reviews
                </h2>
                <p className="text-sm text-gray-500">
                  {googleReviews.length} reviews found (Google returns max 5)
                </p>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {googleReviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No reviews found. Check your Google Place ID and API Key in Settings.
                </p>
              ) : (
                googleReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.authorName}
                        </h3>
                        <div className="flex gap-0.5 mt-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {review.relativeTime}
                        </p>
                      </div>
                      <button
                        onClick={() => importGoogleReview(review, idx)}
                        disabled={review.imported}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          review.imported
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-[#C9A84C] hover:bg-[#b8963e] text-white"
                        }`}
                      >
                        {review.imported ? "Imported" : "Import"}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-4">
                      {review.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
