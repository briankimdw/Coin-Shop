import type { Metadata } from "next";
import AppraisalForm from "@/components/AppraisalForm";

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
      <section className="bg-[#1B2A4A] py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Request a Free Appraisal
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Tell us about your coins, bullion, or collection and get a
            professional valuation at no cost.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-2xl font-bold text-gray-900 md:text-3xl">
          How It Works
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A84C] text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Appraisal Form */}
      <section className="border-y border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
            Submit Your Items
          </h2>
          <p className="mt-2 text-gray-600">
            Provide as much detail as possible for the most accurate appraisal.
          </p>
          <div className="mt-8">
            <AppraisalForm />
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
          What to Expect
        </h2>
        <div className="mt-6 space-y-4 text-gray-600">
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

        <div className="mt-8 rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-6">
          <h3 className="font-serif text-lg font-semibold text-gray-900">
            Prefer to visit in person?
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Walk-ins are always welcome during business hours. Bring your items
            in and we will evaluate them on the spot with immediate payment
            available for accepted offers.
          </p>
        </div>
      </section>
    </div>
  );
}
