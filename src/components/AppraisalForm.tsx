"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export default function AppraisalForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    contactMethod: "email",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length;

    if (totalImages > 5) {
      setErrorMessage("You can upload a maximum of 5 images.");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setErrorMessage("");
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("description", formData.description);
      data.append("contactMethod", formData.contactMethod);
      images.forEach((image) => {
        data.append("images", image);
      });

      const res = await fetch("/api/appraisal", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", description: "", contactMethod: "email" });
        previews.forEach((p) => URL.revokeObjectURL(p));
        setImages([]);
        setPreviews([]);
      } else {
        const result = await res.json();
        setStatus("error");
        setErrorMessage(result.error || "Failed to submit. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to submit. Please try again.");
    }
  }

  const inputClasses = cn(
    "w-full px-4 py-3 rounded-lg border",
    "bg-white",
    "border-gray-300",
    "text-gray-900",
    "placeholder-gray-500",
    "focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent",
    "transition-colors"
  );

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">&#10003;</div>
        <h3 className="text-xl font-serif font-bold text-green-800 mb-2">
          Appraisal Request Submitted!
        </h3>
        <p className="text-green-700 mb-4">
          Thank you! We&apos;ll review your submission and get back to you within 1-2 business days.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-[#C9A84C] hover:underline font-semibold"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="appraisal-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="appraisal-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="appraisal-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="appraisal-email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="appraisal-phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone
        </label>
        <input
          id="appraisal-phone"
          name="phone"
          type="tel"
          placeholder="(555) 555-5555"
          value={formData.phone}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      <div>
        <label
          htmlFor="appraisal-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="appraisal-description"
          name="description"
          required
          rows={5}
          placeholder="Describe the item(s) you'd like appraised. Include any known details such as year, mint mark, condition, quantity, etc."
          value={formData.description}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photos (up to 5)
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            "border-gray-300",
            "hover:border-[#C9A84C]",
            "transition-colors"
          )}
        >
          <div className="text-3xl mb-2">&#128247;</div>
          <p className="text-gray-600 text-sm">
            Click to upload images &middot; {5 - images.length} remaining
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={cn(
                    "absolute -top-2 -right-2 w-6 h-6 rounded-full",
                    "bg-red-500 text-white text-xs flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Contact Method
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="contactMethod"
              value="email"
              checked={formData.contactMethod === "email"}
              onChange={handleChange}
              className="text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <span className="text-gray-700">Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="contactMethod"
              value="phone"
              checked={formData.contactMethod === "phone"}
              onChange={handleChange}
              className="text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <span className="text-gray-700">Phone</span>
          </label>
        </div>
      </div>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors",
          "bg-[#1B2A4A] hover:bg-[#2a3d66]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {status === "loading" ? "Submitting..." : "Submit Appraisal Request"}
      </button>
    </form>
  );
}
