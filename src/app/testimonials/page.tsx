import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

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
          className={cn(
            "w-4 h-4",
            i < rating ? "text-[#C9A84C]" : "text-gray-200"
          )}
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
      <section className="page-hero py-16 md:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Reviews</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Customer Testimonials
          </h1>
          <p className="text-[#FAF7F0]/60 text-lg max-w-2xl mx-auto">
            Don&apos;t just take our word for it &mdash; hear from our satisfied customers
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)]">
              <p className="text-lg text-gray-400">No testimonials yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="relative bg-[var(--surface-alt)] rounded-xl p-7 border border-[var(--border)] transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/6 hover:-translate-y-1"
                >
                  {/* Decorative quote */}
                  <div className="absolute top-5 right-6 font-serif text-6xl text-[#C9A84C]/10 leading-none select-none pointer-events-none">
                    &ldquo;
                  </div>

                  <Stars rating={t.rating} />
                  <blockquote className="mt-4 text-gray-600 leading-relaxed text-[15px] relative z-10">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="font-serif font-bold text-[#1B2A4A] text-sm">
                      {t.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Join Our Customers</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4">
            Ready to Experience It Yourself?
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            Visit us today or book an appointment to buy, sell, or get your coins appraised.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/appointments"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/35 hover:-translate-y-0.5"
            >
              Book an Appointment
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white font-semibold transition-all duration-300 hover:-translate-y-0.5"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
