import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function getSettings() {
  return prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Terms of Service | ${settings.shopName}`,
    description: `Terms of service for ${settings.shopName}.`,
  };
}

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Terms of Service
          </h1>
          <p className="mt-3 text-gray-300">
            Please review the terms governing your use of {settings.shopName}.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* General Terms */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            General Terms
          </h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using the {settings.shopName} website, you agree to
            be bound by these Terms of Service. If you do not agree with any part
            of these terms, you should not use this website. We reserve the right
            to modify these terms at any time, and your continued use of the site
            constitutes acceptance of any changes.
          </p>
        </section>

        {/* Products & Pricing */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Products &amp; Pricing
          </h2>
          <p className="text-gray-700 leading-relaxed">
            All products listed on our website are subject to availability.
            Prices are displayed in US dollars and may change without notice due
            to fluctuations in precious metal spot prices or market conditions.
            While we strive to display accurate product descriptions and images,
            we do not warrant that all information is error-free. Product
            photographs are representative and actual items may vary slightly in
            appearance.
          </p>
        </section>

        {/* Returns & Refunds */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Returns &amp; Refunds
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you are not satisfied with a purchase, please contact us within 7
            days of receiving your item. Items must be returned in their original
            condition and packaging. Refunds are issued at our discretion and may
            be subject to a restocking fee. Bullion and precious metal items may
            be subject to different return policies based on market price
            fluctuations at the time of return.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Limitation of Liability
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {settings.shopName} shall not be liable for any indirect, incidental,
            special, or consequential damages arising out of or in connection
            with your use of this website or any products purchased. Our total
            liability for any claim shall not exceed the amount you paid for the
            specific product or service giving rise to the claim.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed">
            For questions regarding these terms, please reach out to us:
          </p>
          <div className="mt-4 bg-white rounded-xl p-6 border border-gray-200 space-y-2 text-gray-700">
            <p className="font-semibold">{settings.shopName}</p>
            <p>
              {settings.address}, {settings.city}, {settings.state}{" "}
              {settings.zip}
            </p>
            <p>
              Email:{" "}
              <a
                href={`mailto:${settings.email}`}
                className="text-[#C9A84C] hover:underline"
              >
                {settings.email}
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href={`tel:${settings.phone}`}
                className="text-[#C9A84C] hover:underline"
              >
                {settings.phone}
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
