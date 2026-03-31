"use client";

import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  name: string;
  text: string;
  rating: number;
}

export default function TestimonialCard({ name, text, rating }: TestimonialCardProps) {
  return (
    <div className="relative bg-white rounded-xl p-7 flex flex-col gap-4 border border-[var(--border)] transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/6 hover:-translate-y-1">
      {/* Decorative quote mark */}
      <div className="absolute top-5 right-6 font-serif text-6xl text-[#C9A84C]/10 leading-none select-none pointer-events-none">
        &ldquo;
      </div>

      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating
                ? "text-[#C9A84C] fill-[#C9A84C]"
                : "text-gray-200 fill-gray-200"
            )}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-600 italic leading-relaxed text-[15px] relative z-10">
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-auto pt-2 border-t border-gray-100">
        <p className="font-serif font-bold text-[#1B2A4A] text-sm">
          {name}
        </p>
      </div>
    </div>
  );
}
