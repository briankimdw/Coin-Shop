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


export const dynamic = 'force-dynamic';

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
      <section className="page-hero py-16 md:py-20">
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Sell To Us</p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            We Buy Coins, Bullion &amp; Precious Metals
          </h1>
          <p className="mt-4 text-lg text-[#FAF7F0]/60 max-w-2xl mx-auto">
            Get top dollar for your coins, bullion, jewelry, and collections.
            Fair prices, instant payment.
          </p>
          <Link
            href="/appraisal"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] px-8 py-3.5 font-semibold text-white transition-all duration-300 shadow-lg shadow-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/35 hover:-translate-y-0.5"
          >
            Request a Free Appraisal
          </Link>
        </div>
      </section>

      {/* What We Buy */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">What We Purchase</p>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl">
            What We Buy
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-lg">
            We purchase a wide variety of numismatic items and precious metals
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {buyCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-xl border border-[var(--border)] bg-white p-7 text-center transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/6 hover:-translate-y-1 hover:border-[#C9A84C]/30"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#C9A84C]/10 transition-all duration-300 group-hover:bg-[#C9A84C]/20 group-hover:scale-110">
                  <Icon className="h-7 w-7 text-[#C9A84C]" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-bold text-[#1B2A4A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Currently Looking For */}
      {wantToBuyItems.length > 0 && (
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#243558] to-[#1B2A4A]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Actively Seeking</p>
              <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
                Currently Looking For
              </h2>
              <p className="mt-3 text-[#FAF7F0]/50 max-w-2xl mx-auto">
                We&apos;re actively seeking these items &mdash; contact us if you have any!
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wantToBuyItems.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-400 hover:bg-white/10 hover:border-white/20"
                >
                  {item.featured && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                      <FaFire className="text-[10px]" /> Hot
                    </span>
                  )}
                  <span className="inline-block rounded-full bg-[#C9A84C]/15 px-3 py-1 text-xs font-semibold text-[#C9A84C] tracking-wide">
                    {item.category}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-[#FAF7F0]/50 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.priceRange && (
                    <p className="mt-3 text-sm font-semibold text-[#C9A84C]">
                      Offering: {item.priceRange}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] px-8 py-3.5 font-semibold text-white transition-all duration-300 shadow-lg shadow-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/35 hover:-translate-y-0.5"
              >
                Have One of These? Contact Us
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Payout Estimator */}
      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Calculator</p>
            <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl">
              Estimate Your Payout
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Get an instant estimate based on current spot prices
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <PayoutEstimator />
          </div>
        </div>
      </section>

      {/* Submit a Collection CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden p-10 md:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#243558] to-[#1B2A4A]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative">
            <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
              Have a Collection to Sell?
            </h2>
            <p className="mt-4 text-[#FAF7F0]/60 max-w-xl mx-auto text-lg">
              Submit your collection for a free, no-obligation appraisal. We
              respond within 24 hours.
            </p>
            <Link
              href="/appraisal"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] px-8 py-3.5 font-semibold text-white transition-all duration-300 shadow-lg shadow-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/35 hover:-translate-y-0.5"
            >
              Submit a Collection
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--border)] bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Common Questions</p>
            <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] overflow-hidden transition-all duration-300 hover:border-[#C9A84C]/20"
              >
                <summary className="cursor-pointer select-none px-6 py-5 font-serif font-semibold text-[#1B2A4A] transition-colors hover:text-[#C9A84C] list-none flex items-center justify-between">
                  {faq.q}
                  <span className="ml-4 text-[#C9A84C] text-xl transition-transform duration-300 group-open:rotate-45 flex-shrink-0">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
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
