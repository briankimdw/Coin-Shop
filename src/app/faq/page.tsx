import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about buying, selling, and appraising coins and precious metals.",
};

async function getFaqs() {
  return prisma.fAQ.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <JsonLd data={faqJsonLd} />

      {/* Hero */}
      <section className="page-hero py-16 md:py-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Help Center</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-[#FAF7F0]/60 text-lg">
            Answers to common questions about our products and services.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {faqs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white border border-[var(--border)]">
            <p className="text-gray-400 text-lg">No FAQs available at this time. Check back soon.</p>
          </div>
        ) : (
          <FaqAccordion faqs={faqs} />
        )}

        {/* Still have questions CTA */}
        <div className="mt-14 text-center bg-white rounded-2xl border border-[var(--border)] p-10">
          <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-500 mb-6">
            We&apos;re here to help. Reach out to us and we&apos;ll get back to you promptly.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#1B2A4A] to-[#243558] text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#1B2A4A]/25 hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
