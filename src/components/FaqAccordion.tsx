"use client";

import { useState } from "react";

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
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span
                className={`font-serif text-lg font-semibold transition-colors ${
                  isOpen ? "text-[#C9A84C]" : "text-[#1B2A4A]"
                }`}
              >
                {faq.question}
              </span>
              <span
                className={`ml-4 text-xl transition-transform ${
                  isOpen ? "rotate-45" : ""
                } text-[#C9A84C]`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
