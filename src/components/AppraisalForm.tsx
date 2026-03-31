"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { processImageFiles } from "@/lib/image-utils";

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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length;

    if (totalImages > 5) {
      setErrorMessage("You can upload a maximum of 5 images.");
      return;
    }

    const { compressed, errors } = await processImageFiles(files);
    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
      if (compressed.length === 0) return;
    }

    const newImages = [...images, ...compressed];
    setImages(newImages);

    const newPreviews = compressed.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (errors.length === 0) setErrorMessage("");
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
    "border-gray-200",
    "text-[#1B2A4A]",
    "placeholder-gray-400",
    "focus:outline-none focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)]",
    "transition-all duration-300"
  );

  const labelClasses = "block text-sm font-semibold text-[#1B2A4A] mb-1.5";

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">&#10003;</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-green-800 mb-2">
          Appraisal Request Submitted!
        </h3>
        <p className="text-green-700 mb-6">
          Thank you! We&apos;ll review your submission and get back to you within 1-2 business days.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-[#C9A84C] hover:text-[#B8942E] font-semibold transition-colors duration-300"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="appraisal-name" className={labelClasses}>
            Name <span className="text-red-400">*</span>
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
          <label htmlFor="appraisal-email" className={labelClasses}>
            Email <span className="text-red-400">*</span>
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
        <label htmlFor="appraisal-phone" className={labelClasses}>
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
        <label htmlFor="appraisal-description" className={labelClasses}>
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="appraisal-description"
          name="description"
          required
          rows={5}
          placeholder="Describe the item(s) you'd like appraised. Include any known details such as year, mint mark, condition, quantity, etc."
          value={formData.description}
          onChange={handleChange}
          className={cn(inputClasses, "resize-none")}
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className={labelClasses}>
          Photos <span className="text-gray-400 font-normal">(up to 5)</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer",
            "border-gray-200 bg-gray-50/50",
            "hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/[0.02]",
            "transition-all duration-300"
          )}
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-[#C9A84C] text-xl">&#128247;</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Click to upload images
            </p>
            <p className="text-gray-400 text-xs">
              {5 - images.length} {5 - images.length === 1 ? "slot" : "slots"} remaining
            </p>
          </div>
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
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={cn(
                    "absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full",
                    "bg-red-500 text-white text-xs flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "shadow-lg hover:bg-red-600 hover:scale-110"
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
        <label className={labelClasses}>
          Preferred Contact Method
        </label>
        <div className="flex gap-4 mt-1">
          <label className={cn(
            "flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-300",
            formData.contactMethod === "email"
              ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#1B2A4A]"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          )}>
            <input
              type="radio"
              name="contactMethod"
              value="email"
              checked={formData.contactMethod === "email"}
              onChange={handleChange}
              className="text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <span className="text-sm font-medium">Email</span>
          </label>
          <label className={cn(
            "flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-lg border transition-all duration-300",
            formData.contactMethod === "phone"
              ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#1B2A4A]"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          )}>
            <input
              type="radio"
              name="contactMethod"
              value="phone"
              checked={formData.contactMethod === "phone"}
              onChange={handleChange}
              className="text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <span className="text-sm font-medium">Phone</span>
          </label>
        </div>
      </div>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "w-full px-6 py-3.5 rounded-lg font-semibold text-white transition-all duration-300",
          "bg-gradient-to-r from-[#1B2A4A] to-[#243558]",
          "hover:shadow-lg hover:shadow-[#1B2A4A]/25 hover:-translate-y-0.5",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        )}
      >
        {status === "loading" ? "Submitting..." : "Submit Appraisal Request"}
      </button>
    </form>
  );
}
