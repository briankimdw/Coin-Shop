import Link from "next/link";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { parseJsonField } from "@/lib/utils";
import SpotPriceBar from "@/components/ui/SpotPriceBar";
import FeaturedCoins from "@/components/FeaturedCoins";
import TestimonialCard from "@/components/TestimonialCard";
import NewsletterForm from "@/components/NewsletterForm";
import { JsonLd } from "@/components/JsonLd";
import {
  GiTwoCoins,
  GiGoldBar,
  GiDiamondRing,
  GiNewspaper,
  GiBookshelf,
  GiReceiveMoney,
} from "react-icons/gi";
import { FaShieldAlt, FaAward, FaHandshake, FaStar } from "react-icons/fa";

export const dynamic = 'force-dynamic';

async function getSettings() {
  return prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

const services = [
  {
    icon: GiTwoCoins,
    title: "Coins",
    description: "US & World coins, from ancient to modern. Individual pieces and full collections.",
  },
  {
    icon: GiGoldBar,
    title: "Bullion",
    description: "Gold, silver, and platinum bars and rounds at competitive premiums.",
  },
  {
    icon: GiDiamondRing,
    title: "Jewelry",
    description: "Gold, silver, and platinum jewelry. We buy scrap and finished pieces.",
  },
  {
    icon: GiNewspaper,
    title: "Currency",
    description: "Paper money, banknotes, and certificates from around the world.",
  },
  {
    icon: GiBookshelf,
    title: "Collections",
    description: "Full and partial coin collections evaluated and purchased.",
  },
  {
    icon: GiReceiveMoney,
    title: "Estates",
    description: "Estate liquidation and evaluation services with fair, honest offers.",
  },
];

const trustBadges = [
  { icon: FaShieldAlt, label: "Trusted Dealer" },
  { icon: FaAward, label: "ANA Member" },
  { icon: FaHandshake, label: "Fair Prices" },
  { icon: FaStar, label: "5-Star Rated" },
];

export default async function HomePage() {
  const [settings, testimonials] = await Promise.all([
    getSettings(),
    getTestimonials(),
  ]);

  const hours = parseJsonField<
    Array<{ day: string; open: string; close: string; closed: boolean }>
  >(settings.hoursJson, []);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: settings.shopName,
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressLocality: settings.city,
            addressRegion: settings.state,
            postalCode: settings.zip,
          },
          telephone: settings.phone,
          email: settings.email,
          url: `https://www.yourcoinshop.com`,
        }}
      />

      {/* ====== HERO SECTION ====== */}
      <section className="relative min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 bg-[#1B2A4A]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#243558] to-[#1B2A4A]" />
        {/* Subtle radial accents */}
        <div className="absolute inset-0 opacity-100">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9A84C]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C9A84C]/[0.03] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            {/* Small label */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
              <span className="text-[#C9A84C] text-xs font-semibold tracking-wider uppercase">
                Trusted Since {settings.yearsInBusiness ? `${new Date().getFullYear() - Number(settings.yearsInBusiness)}` : "2000"}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {settings.heroTitle || "Buy, Sell & Trade Coins & Precious Metals"}
            </h1>
            <p className="text-lg sm:text-xl text-[#FAF7F0]/70 mb-10 max-w-2xl leading-relaxed">
              {settings.heroSubtitle || settings.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/inventory"
                className={cn(
                  "inline-flex items-center justify-center px-8 py-4 rounded-lg",
                  "bg-gradient-to-r from-[#C9A84C] to-[#B8942E] text-white font-semibold text-lg",
                  "transition-all duration-300",
                  "shadow-lg shadow-[#C9A84C]/25",
                  "hover:shadow-xl hover:shadow-[#C9A84C]/35 hover:-translate-y-0.5"
                )}
              >
                Browse Inventory
              </Link>
              <Link
                href="/appraisal"
                className={cn(
                  "inline-flex items-center justify-center px-8 py-4 rounded-lg",
                  "border-2 border-[#C9A84C]/60 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white hover:border-[#C9A84C]",
                  "font-semibold text-lg transition-all duration-300",
                  "hover:-translate-y-0.5"
                )}
              >
                Get a Free Appraisal
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1B2A4A] to-transparent" />
      </section>

      {/* ====== TRUST BADGES ====== */}
      <div className="relative z-10 bg-[#1B2A4A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2.5 text-[#FAF7F0]/50">
                <badge.icon className="h-4 w-4 text-[#C9A84C]/70" />
                <span className="text-xs sm:text-sm font-medium tracking-wide">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== SPOT PRICES ====== */}
      <SpotPriceBar />

      {/* ====== FEATURED COINS ====== */}
      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Our Collection</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Featured Coins
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Hand-picked selections from our current inventory
            </p>
          </div>
          <FeaturedCoins />
          <div className="text-center mt-12">
            <Link
              href="/inventory"
              className={cn(
                "inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold",
                "text-[#C9A84C] border-2 border-[#C9A84C]",
                "hover:bg-[#C9A84C] hover:text-white transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C9A84C]/20"
              )}
            >
              View Full Inventory
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ====== WE BUY & SELL SECTION ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              We Buy &amp; Sell
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Whether you&apos;re looking to buy or sell, we offer fair prices and expert knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className={cn(
                  "relative bg-[var(--surface-alt)] rounded-xl p-7",
                  "border border-[var(--border)]",
                  "hover:border-[#C9A84C]/40 hover:shadow-xl hover:shadow-[#C9A84C]/5 transition-all duration-400",
                  "group hover:-translate-y-1"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#C9A84C]/10 mb-5 transition-all duration-300 group-hover:bg-[#C9A84C]/20 group-hover:scale-110">
                  <service.icon className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-[var(--surface-alt)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Testimonials</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
                What Our Customers Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  text={testimonial.text}
                  rating={testimonial.rating}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/testimonials"
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold",
                  "text-[#C9A84C] border-2 border-[#C9A84C]",
                  "hover:bg-[#C9A84C] hover:text-white transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C9A84C]/20"
                )}
              >
                See All Reviews
                <span className="text-lg">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ====== MAP & CONTACT ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Location</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Visit Us
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Map */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden min-h-[350px] flex items-center justify-center shadow-inner">
              {settings.googleMapsEmbed ? (
                <div
                  className="w-full h-full min-h-[350px]"
                  dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
                />
              ) : (
                <div className="text-center text-gray-400 p-8">
                  <div className="text-5xl mb-3">&#128205;</div>
                  <p className="font-medium">Google Maps embed will appear here</p>
                  <p className="text-sm mt-1">Configure in admin settings</p>
                </div>
              )}
            </div>

            {/* Contact Info & Hours */}
            <div className="space-y-8">
              <div className="bg-[var(--surface-alt)] rounded-2xl p-7 border border-[var(--border)]">
                <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-5">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
                      <span className="text-[#C9A84C] text-lg">&#128205;</span>
                    </div>
                    <span className="text-gray-600 pt-2">
                      {settings.address}, {settings.city}, {settings.state} {settings.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
                      <span className="text-[#C9A84C] text-lg">&#128222;</span>
                    </div>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-gray-600 hover:text-[#C9A84C] transition-colors duration-300"
                    >
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
                      <span className="text-[#C9A84C] text-lg">&#9993;</span>
                    </div>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-gray-600 hover:text-[#C9A84C] transition-colors duration-300"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface-alt)] rounded-2xl p-7 border border-[var(--border)]">
                <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-5">
                  Store Hours
                </h3>
                <div className="space-y-3">
                  {hours.map((h) => (
                    <div
                      key={h.day}
                      className="flex justify-between text-sm pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <span className="font-medium text-gray-700">
                        {h.day}
                      </span>
                      <span className={cn(
                        "font-medium",
                        h.closed
                          ? "text-red-400"
                          : "text-gray-600"
                      )}>
                        {h.closed ? "Closed" : `${h.open} - ${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== NEWSLETTER ====== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#243558] to-[#1B2A4A]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Stay Connected</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-[#FAF7F0]/60 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            Subscribe to our newsletter for new inventory alerts, market updates, and exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
