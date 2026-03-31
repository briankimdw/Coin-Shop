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
    title: `Privacy Policy | ${settings.shopName}`,
    description: `Privacy policy for ${settings.shopName}.`,
  };
}

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 text-gray-300">
            Your privacy is important to {settings.shopName}.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Information Collection */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Information Collection
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {settings.shopName} collects information you voluntarily provide when
            you contact us, subscribe to our newsletter, submit an inquiry or
            appraisal request, or make a purchase. This may include your name,
            email address, phone number, and mailing address. We may also
            automatically collect certain technical information such as your
            browser type and IP address when you visit our website.
          </p>
        </section>

        {/* Use of Information */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Use of Information
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We use the information we collect to respond to your inquiries,
            process transactions, send newsletters and promotional materials you
            have opted into, improve our website and services, and comply with
            applicable legal obligations. We do not sell, trade, or rent your
            personal information to third parties.
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Cookies
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our website may use cookies to enhance your browsing experience.
            Cookies are small data files stored on your device that help us
            understand how you use our site. You can configure your browser to
            refuse cookies, though doing so may limit certain features of the
            website.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Data Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {settings.shopName} takes reasonable measures to protect your
            personal information from unauthorized access, alteration, or
            disclosure. However, no method of electronic transmission or storage
            is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this privacy policy, please contact us:
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
