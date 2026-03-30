import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";

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
    <div className="min-h-screen bg-[#FAF9F6]">
      <JsonLd data={faqJsonLd} />

      {/* Hero */}
      <section className="bg-[#1B2A4A] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-gray-300">
            Answers to common questions about our products and services.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faqs.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No FAQs available at this time. Check back soon.
          </p>
        ) : (
          <FaqAccordion faqs={faqs} />
        )}
      </div>
    </div>
  );
}
