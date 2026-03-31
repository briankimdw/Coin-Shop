import type { Metadata } from "next";
import AppraisalForm from "@/components/AppraisalForm";


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Request a Free Appraisal",
  description:
    "Submit your coins, bullion, or collection for a free professional appraisal. We respond within 24 hours with a competitive offer.",
};

const steps = [
  {
    number: "1",
    title: "Submit",
    desc: "Fill out the form below with details about your items. Upload photos if you have them -- clear images help us give a more accurate estimate.",
  },
  {
    number: "2",
    title: "Review",
    desc: "Our experts will carefully review your submission and research current market values for your items. We typically respond within 24 hours.",
  },
  {
    number: "3",
    title: "Offer",
    desc: "We'll contact you with a competitive, no-obligation offer. If you accept, we can arrange pickup or you can bring items to our shop for immediate payment.",
  },
];

export default function AppraisalPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="page-hero py-16 md:py-20">
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Free Valuation</p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Request a Free Appraisal
          </h1>
          <p className="mt-4 text-lg text-[#FAF7F0]/60 max-w-2xl mx-auto">
            Tell us about your coins, bullion, or collection and get a
            professional valuation at no cost.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl">
            How It Works
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#C9A84C]/30 to-[#C9A84C]/10" />
              )}
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#B8942E] text-xl font-bold text-white shadow-lg shadow-[#C9A84C]/20">
                {step.number}
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold text-[#1B2A4A]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Appraisal Form */}
      <section className="bg-[var(--surface-alt)] py-20 border-y border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl mb-2">
            Submit Your Items
          </h2>
          <p className="text-gray-500 mb-8">
            Provide as much detail as possible for the most accurate appraisal.
          </p>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 sm:p-8 shadow-sm">
            <AppraisalForm />
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] md:text-3xl mb-6">
          What to Expect
        </h2>
        <div className="space-y-4 text-gray-600 text-[17px]">
          <p className="leading-relaxed">
            After you submit your appraisal request, one of our experienced
            numismatists will review your items. We evaluate based on current
            market conditions, metal content, rarity, condition, and collector
            demand.
          </p>
          <p className="leading-relaxed">
            You will receive a detailed response via your preferred contact
            method, typically within 24 hours. Our appraisals are always free
            and come with no obligation to sell.
          </p>
          <p className="leading-relaxed">
            For large collections or estates, we may suggest an in-person
            evaluation at our shop or your location. We handle every transaction
            with professionalism and discretion.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-7">
          <h3 className="font-serif text-lg font-bold text-[#1B2A4A]">
            Prefer to visit in person?
          </h3>
          <p className="mt-2 text-gray-600 leading-relaxed">
            Walk-ins are always welcome during business hours. Bring your items
            in and we will evaluate them on the spot with immediate payment
            available for accepted offers.
          </p>
        </div>
      </section>
    </div>
  );
}
