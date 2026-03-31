"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={cn(
              "bg-white rounded-xl border overflow-hidden transition-all duration-400",
              isOpen ? "border-[#C9A84C]/30 shadow-lg shadow-[#C9A84C]/5" : "border-[var(--border)] hover:border-[#C9A84C]/20"
            )}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex items-center justify-between px-7 py-5 text-left group"
            >
              <span
                className={cn(
                  "font-serif text-[17px] font-bold transition-colors duration-300 pr-4",
                  isOpen ? "text-[#C9A84C]" : "text-[#1B2A4A] group-hover:text-[#C9A84C]"
                )}
              >
                {faq.question}
              </span>
              <span
                className={cn(
                  "ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300",
                  isOpen
                    ? "bg-[#C9A84C] text-white rotate-45"
                    : "bg-[#C9A84C]/10 text-[#C9A84C]"
                )}
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-400",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="px-7 pb-6 text-gray-600 leading-relaxed text-[15px]">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
