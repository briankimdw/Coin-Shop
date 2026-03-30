import type { Metadata } from "next";
import Link from "next/link";
import {
  GiTwoCoins,
  GiGoldBar,
  GiDiamondRing,
  GiNewspaper,
  GiBookshelf,
  GiReceiveMoney,
} from "react-icons/gi";
import { FaFire } from "react-icons/fa";
import PayoutEstimator from "@/components/PayoutEstimator";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "We Buy Coins & Precious Metals",
  description:
    "Sell your coins, bullion, jewelry, and collections for top dollar. Free appraisals and competitive payouts.",
};

const buyCategories = [
  {
    icon: GiTwoCoins,
    title: "Gold Coins",
    desc: "American Eagles, Krugerrands, Maple Leafs, pre-1933 US gold, and all world gold coins.",
  },
  {
    icon: GiTwoCoins,
    title: "Silver Coins",
    desc: "Morgan & Peace dollars, Walking Liberty halves, 90% constitutional silver, and world silver.",
  },
  {
    icon: GiGoldBar,
    title: "Gold Bullion",
    desc: "Gold bars, rounds, and ingots from all major refiners in any size.",
  },
  {
    icon: GiGoldBar,
    title: "Silver Bullion",
    desc: "Silver bars, rounds, and ingots. We buy all sizes from 1 oz to 100 oz.",
  },
  {
    icon: GiDiamondRing,
    title: "Jewelry",
    desc: "Gold, silver, and platinum jewelry. Broken, scrap, or fine jewelry welcome.",
  },
  {
    icon: GiNewspaper,
    title: "Paper Money",
    desc: "US currency, large size notes, silver certificates, Confederate, and foreign banknotes.",
  },
  {
    icon: GiBookshelf,
    title: "Collections",
    desc: "Complete or partial coin collections of any size. We evaluate and make fair offers.",
  },
  {
    icon: GiReceiveMoney,
    title: "Estates",
    desc: "Estate liquidations and inherited collections. We handle large lots with care and discretion.",
  },
];

const faqs = [
  {
    q: "How do I sell my coins?",
    a: "Simply bring your items to our shop during business hours, or submit a free appraisal request online. We'll evaluate your items on the spot and make you a competitive cash offer with no obligation.",
  },
  {
    q: "How are prices determined?",
    a: "We base our offers on current precious metal spot prices, coin rarity, condition, and current market demand. We use industry-standard pricing guides and real-time market data to ensure fair offers.",
  },
  {
    q: "Do I need an appointment?",
    a: "Walk-ins are always welcome during business hours. For large collections or estates, we recommend scheduling an appointment so we can dedicate the proper time and attention to your items.",
  },
  {
    q: "What forms of payment do you offer?",
    a: "We pay by cash, check, or wire transfer. For larger transactions, we can arrange a bank wire for same-day payment. All transactions are conducted professionally and discreetly.",
  },
  {
    q: "Do you buy damaged or cleaned coins?",
    a: "Yes, we buy coins in all conditions including cleaned, damaged, or circulated pieces. While condition affects value, we make fair offers on everything. Bring in what you have and we'll take a look.",
  },
];

export default async function WeBuyPage() {
  const wantToBuyItems = await prisma.wantToBuyItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="bg-[#1B2A4A] py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            We Buy Coins, Bullion &amp; Precious Metals
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Get top dollar for your coins, bullion, jewelry, and collections.
            Fair prices, instant payment.
          </p>
          <Link
            href="/appraisal"
            className="mt-6 inline-block rounded-lg bg-[#C9A84C] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#b8973f]"
          >
            Request a Free Appraisal
          </Link>
        </div>
      </section>

      {/* What We Buy */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-2xl font-bold text-gray-900 md:text-3xl">
          What We Buy
        </h2>
        <p className="mt-2 text-center text-gray-600">
          We purchase a wide variety of numismatic items and precious metals
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {buyCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A84C]/10">
                  <Icon className="h-7 w-7 text-[#C9A84C]" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Currently Looking For */}
      {wantToBuyItems.length > 0 && (
        <section className="border-t border-gray-200 bg-gradient-to-b from-[#1B2A4A] to-[#243558] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-serif text-2xl font-bold text-white md:text-3xl">
              Currently Looking For
            </h2>
            <p className="mt-2 text-center text-gray-300">
              We&apos;re actively seeking these items &mdash; contact us if you have any!
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wantToBuyItems.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition-all hover:bg-white/10"
                >
                  {item.featured && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                      <FaFire className="text-[10px]" /> Hot
                    </span>
                  )}
                  <span className="inline-block rounded-full bg-[#C9A84C]/20 px-2.5 py-0.5 text-xs font-medium text-[#C9A84C]">
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-serif text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.priceRange && (
                    <p className="mt-2 text-sm font-medium text-[#C9A84C]">
                      Offering: {item.priceRange}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/contact"
                className="inline-block rounded-lg bg-[#C9A84C] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#b8973f]"
              >
                Have One of These? Contact Us
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Payout Estimator */}
      <section className="border-y border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-2xl font-bold text-gray-900 md:text-3xl">
            Estimate Your Payout
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Get an instant estimate based on current spot prices
          </p>
          <div className="mt-8">
            <PayoutEstimator />
          </div>
        </div>
      </section>

      {/* Submit a Collection CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#1B2A4A] p-8 text-center md:p-12">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            Have a Collection to Sell?
          </h2>
          <p className="mt-3 text-gray-300">
            Submit your collection for a free, no-obligation appraisal. We
            respond within 24 hours.
          </p>
          <Link
            href="/appraisal"
            className="mt-6 inline-block rounded-lg bg-[#C9A84C] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#b8973f]"
          >
            Submit a Collection
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-2xl font-bold text-gray-900 md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-lg border border-gray-200 bg-gray-50"
              >
                <summary className="cursor-pointer select-none px-6 py-4 font-medium text-gray-900 transition-colors hover:text-[#C9A84C]">
                  {faq.q}
                </summary>
                <div className="px-6 pb-4 text-sm leading-relaxed text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
