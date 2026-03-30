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
      <section className="relative bg-[#1B2A4A] min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/90 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight max-w-3xl">
            {settings.heroTitle || "Buy, Sell & Trade Coins & Precious Metals"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl">
            {settings.heroSubtitle || settings.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/inventory"
              className={cn(
                "inline-flex items-center justify-center px-8 py-4 rounded-lg",
                "bg-[#C9A84C] hover:bg-[#b8963f] text-white font-semibold text-lg",
                "transition-colors shadow-lg"
              )}
            >
              Browse Inventory
            </Link>
            <Link
              href="/appraisal"
              className={cn(
                "inline-flex items-center justify-center px-8 py-4 rounded-lg",
                "border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white",
                "font-semibold text-lg transition-colors"
              )}
            >
              Get a Free Appraisal
            </Link>
          </div>
        </div>
      </section>

      {/* ====== SPOT PRICES ====== */}
      <SpotPriceBar />

      {/* ====== FEATURED COINS ====== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-3">
              Featured Coins
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hand-picked selections from our current inventory
            </p>
          </div>
          <FeaturedCoins />
          <div className="text-center mt-8">
            <Link
              href="/inventory"
              className={cn(
                "inline-flex items-center px-6 py-3 rounded-lg font-semibold",
                "text-[#C9A84C] border-2 border-[#C9A84C]",
                "hover:bg-[#C9A84C] hover:text-white transition-colors"
              )}
            >
              View Full Inventory &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ====== WE BUY & SELL SECTION ====== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-3">
              We Buy &amp; Sell
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re looking to buy or sell, we offer fair prices and expert knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className={cn(
                  "bg-gray-50 rounded-xl p-6",
                  "border border-gray-100",
                  "hover:border-[#C9A84C]/50 hover:shadow-lg transition-all duration-300",
                  "group"
                )}
              >
                <service.icon className="w-10 h-10 text-[#C9A84C] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-3">
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
            <div className="text-center mt-8">
              <Link
                href="/testimonials"
                className={cn(
                  "inline-flex items-center px-6 py-3 rounded-lg font-semibold",
                  "text-[#C9A84C] border-2 border-[#C9A84C]",
                  "hover:bg-[#C9A84C] hover:text-white transition-colors"
                )}
              >
                See All Reviews &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ====== MAP & CONTACT ====== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-3">
              Visit Us
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Map */}
            <div className="bg-gray-200 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
              {settings.googleMapsEmbed ? (
                <div
                  className="w-full h-full min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
                />
              ) : (
                <div className="text-center text-gray-500 p-8">
                  <div className="text-4xl mb-2">&#128205;</div>
                  <p>Google Maps embed will appear here</p>
                  <p className="text-sm mt-1">Configure in admin settings</p>
                </div>
              )}
            </div>

            {/* Contact Info & Hours */}
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C9A84C] mt-1">&#128205;</span>
                    <span className="text-gray-700">
                      {settings.address}, {settings.city}, {settings.state} {settings.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#C9A84C]">&#128222;</span>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-gray-700 hover:text-[#C9A84C] transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#C9A84C]">&#9993;</span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-gray-700 hover:text-[#C9A84C] transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#1B2A4A] mb-4">
                  Store Hours
                </h3>
                <div className="space-y-2">
                  {hours.map((h) => (
                    <div
                      key={h.day}
                      className="flex justify-between text-sm border-b border-gray-100 pb-2"
                    >
                      <span className="font-medium text-gray-700">
                        {h.day}
                      </span>
                      <span className={cn(
                        h.closed
                          ? "text-red-500"
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
      <section className="py-16 bg-[#1B2A4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Stay Updated
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for new inventory alerts, market updates, and exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
