"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again.");
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
          Message Sent!
        </h3>
        <p className="text-green-700 mb-6">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-[#C9A84C] hover:text-[#B8942E] font-semibold transition-colors duration-300"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClasses}>
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="contact-name"
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
          <label htmlFor="contact-email" className={labelClasses}>
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="contact-email"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-phone" className={labelClasses}>
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="(555) 555-5555"
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClasses}>
            Subject <span className="text-red-400">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Buying">Buying Coins</option>
            <option value="Selling">Selling Coins</option>
            <option value="Appraisal">Appraisal Request</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClasses}>
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="How can we help you?"
          value={formData.message}
          onChange={handleChange}
          className={cn(inputClasses, "resize-none")}
        />
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
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
