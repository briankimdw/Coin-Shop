"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaSave, FaSpinner, FaTimes, FaUpload, FaCamera } from "react-icons/fa";
import { shopConfig } from "@/config/shop";
import CameraCapture from "@/components/ui/CameraCapture";

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    category: "",
    metal: "",
    year: "",
    mintMark: "",
    grade: "",
    certification: "",
    certNumber: "",
    description: "",
    costBasis: "",
    askingPrice: "",
    quantity: "1",
    featured: false,
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`/api/inventory/${id}`);
        const data = await res.json();
        setForm({
          title: data.title || "",
          category: data.category || "",
          metal: data.metal || "",
          year: data.year?.toString() || "",
          mintMark: data.mintMark || "",
          grade: data.grade || "",
          certification: data.certification || "",
          certNumber: data.certNumber || "",
          description: data.description || "",
          costBasis: data.costBasis?.toString() || "",
          askingPrice: data.askingPrice?.toString() || "",
          quantity: data.quantity?.toString() || "1",
          featured: data.featured || false,
        });
        const imgs = typeof data.images === "string" ? (() => { try { return JSON.parse(data.images); } catch { return []; } })() : (data.images || []);
        setExistingImages(imgs);
      } catch {
        // handle error
      } finally {
        setFetching(false);
      }
    }
    fetchItem();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleCameraCapture = (file: File) => {
    setNewImages((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewPreviews((prev) => [...prev, ev.target?.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("removedImages", JSON.stringify(removedImages));
      newImages.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/inventory");
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Edit Listing
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Update inventory item details</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200/80 p-6 space-y-6 max-w-3xl"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field w-full"
            required
          />
        </div>

        {/* Category & Metal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">Select category</option>
              {shopConfig.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metal
            </label>
            <select
              name="metal"
              value={form.metal}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">Select metal</option>
              {shopConfig.metals.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year & Mint Mark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mint Mark
            </label>
            <input
              type="text"
              name="mintMark"
              value={form.mintMark}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Grade & Certification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              name="grade"
              value={form.grade}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">Select grade</option>
              {shopConfig.grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification
            </label>
            <select
              name="certification"
              value={form.certification}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="">Select service</option>
              {shopConfig.certServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cert Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cert Number
          </label>
          <input
            type="text"
            name="certNumber"
            value={form.certNumber}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="input-field w-full"
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Basis
            </label>
            <input
              type="number"
              name="costBasis"
              value={form.costBasis}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asking Price *
            </label>
            <input
              type="number"
              name="askingPrice"
              value={form.askingPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          {/* Existing images */}
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((url) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt="Existing"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            {/* New image previews */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative group">
                <img
                  src={src}
                  alt={`New ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-[#C9A84C]"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              <FaUpload />
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#C9A84C] rounded-lg text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-colors"
            >
              <FaCamera />
              Take Photo
            </button>
          </div>
        </div>

        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}

        {/* Featured */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            id="featured"
            checked={form.featured}
            onChange={handleChange}
            className="w-4 h-4 text-[#C9A84C] rounded"
          />
          <label
            htmlFor="featured"
            className="text-sm font-medium text-gray-700"
          >
            Featured Listing
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSave />
            )}
            {loading ? "Saving..." : "Update Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/inventory")}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
