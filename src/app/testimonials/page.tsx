import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Customer Testimonials",
  description:
    "Read what our customers have to say about their experience buying and selling coins with us.",
};

async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar
          key={i}
          className={i < rating ? "text-[#C9A84C]" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1B2A4A] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Customer Testimonials
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Don&apos;t just take our word for it &mdash; hear from our satisfied customers
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No testimonials yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <Stars rating={t.rating} />
                  <blockquote className="mt-4 text-gray-700 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <p className="mt-4 font-semibold text-[#1B2A4A]">
                    &mdash; {t.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4">
            Ready to Experience It Yourself?
          </h2>
          <p className="text-gray-600 mb-8">
            Visit us today or book an appointment to buy, sell, or get your coins appraised.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/appointments"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#C9A84C] hover:bg-[#b8963f] text-white font-semibold transition-colors"
            >
              Book an Appointment
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
