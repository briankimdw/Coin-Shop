"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaCamera, FaImages, FaTimes, FaArrowRight, FaSpinner } from "react-icons/fa";
import CameraCapture from "@/components/ui/CameraCapture";
import { shopConfig } from "@/config/shop";
import { processImageFiles, compressImage } from "@/lib/image-utils";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function QuickAddModal({ isOpen, onClose, onCreated }: QuickAddModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Step 2 state
  const [title, setTitle] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [category, setCategory] = useState(shopConfig.categories[0]);
  const [metal, setMetal] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setStep(1);
    setShowCamera(false);
    setCapturedPhotos([]);
    setPhotoPreviews([]);
    setTitle("");
    setAskingPrice("");
    setCategory(shopConfig.categories[0]);
    setMetal("");
    setSaving(false);
    onClose();
  };

  const handleCameraCapture = async (file: File) => {
    const compressed = await compressImage(file);
    setCapturedPhotos((prev) => [...prev, compressed]);
    const url = URL.createObjectURL(compressed);
    setPhotoPreviews((prev) => [...prev, url]);
    setShowCamera(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const { compressed, errors } = await processImageFiles(files);
    if (errors.length > 0) {
      alert(errors.join("\n"));
    }
    for (const file of compressed) {
      setCapturedPhotos((prev) => [...prev, file]);
      const url = URL.createObjectURL(file);
      setPhotoPreviews((prev) => [...prev, url]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (addDetails: boolean) => {
    if (!title.trim() || !askingPrice) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("askingPrice", askingPrice);
      formData.append("category", category);
      if (metal) formData.append("metal", metal);

      for (const photo of capturedPhotos) {
        formData.append("images", photo);
      }

      const res = await fetch("/api/inventory", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save");

      const listing = await res.json();
      onCreated();

      if (addDetails) {
        resetAndClose();
        router.push(`/admin/inventory/${listing.id}/edit`);
      } else {
        resetAndClose();
      }
    } catch {
      alert("Failed to save listing. Please try again.");
      setSaving(false);
    }
  };

  // Camera overlay
  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1B2A4A]">
            {step === 1 ? "Add Photos" : "Quick Details"}
          </h2>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="p-5">
          {step === 1 ? (
            /* Step 1: Photos */
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex-1 flex flex-col items-center gap-2 py-6 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C9A84C] transition-colors"
                >
                  <FaCamera className="text-2xl text-[#C9A84C]" />
                  <span className="text-sm font-medium text-gray-700">
                    Take Photo
                  </span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center gap-2 py-6 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C9A84C] transition-colors"
                >
                  <FaImages className="text-2xl text-[#C9A84C]" />
                  <span className="text-sm font-medium text-gray-700">
                    Upload from Gallery
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </div>

              {/* Photo thumbnails */}
              {photoPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <img
                        src={preview}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-[8px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={capturedPhotos.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#C9A84C] hover:bg-[#b8963e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Continue <FaArrowRight className="text-xs" />
              </button>
            </div>
          ) : (
            /* Step 2: Quick Details */
            <div className="space-y-4">
              {/* Photo thumbnails at top */}
              {photoPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={preview}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 1921 Morgan Silver Dollar"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] outline-none transition-all text-sm"
                />
              </div>

              {/* Asking Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asking Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] outline-none transition-all text-sm bg-white"
                >
                  {shopConfig.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal
                </label>
                <select
                  value={metal}
                  onChange={(e) => setMetal(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] outline-none transition-all text-sm bg-white"
                >
                  <option value="">Select metal...</option>
                  {shopConfig.metals.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving || !title.trim() || !askingPrice}
                  className="flex-1 py-3 bg-[#C9A84C] hover:bg-[#b8963e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" />
                  ) : null}
                  Save & Done
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !title.trim() || !askingPrice}
                  className="flex-1 py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 border border-gray-300 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" />
                  ) : null}
                  Save & Add Details
                </button>
              </div>

              {/* Back button */}
              <button
                onClick={() => setStep(1)}
                disabled={saving}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors"
              >
                Back to photos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
