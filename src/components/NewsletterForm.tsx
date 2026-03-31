"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto rounded-xl bg-green-500/10 border border-green-500/20 p-6 text-center">
        <div className="text-green-400 text-3xl mb-2">&#10003;</div>
        <p className="text-green-400 font-semibold">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "w-full px-5 py-3.5 rounded-lg border",
            "bg-white/10 backdrop-blur-sm",
            "border-white/20",
            "text-white",
            "placeholder-white/40",
            "focus:outline-none focus:border-[#C9A84C] focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]",
            "transition-all duration-300"
          )}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "px-8 py-3.5 rounded-lg font-semibold transition-all duration-300",
          "bg-gradient-to-r from-[#C9A84C] to-[#B8942E] text-white",
          "hover:shadow-lg hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        )}
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm self-center sm:absolute sm:bottom-0 sm:translate-y-full sm:pt-2">{message}</p>
      )}
    </form>
  );
}
