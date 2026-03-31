import prisma from "@/lib/prisma";
import { cn, parseJsonField, isCurrentlyOpen } from "@/lib/utils";
import ContactForm from "@/components/ContactForm";

export const dynamic = 'force-dynamic';

async function getSettings() {
  let settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: { id: "default" } });
  }
  return settings;
}

export default async function ContactPage() {
  const settings = await getSettings();

  const hours = parseJsonField<
    Array<{ day: string; open: string; close: string; closed: boolean }>
  >(settings.hoursJson, []);

  const isOpen = isCurrentlyOpen(settings.hoursJson);

  return (
    <>
      {/* ====== HERO BANNER ====== */}
      <section className="page-hero py-16 md:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Get In Touch</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-[#FAF7F0]/60 text-lg max-w-2xl mx-auto">
            Have a question or want to sell your coins? Get in touch with us today.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* ====== CONTACT FORM ====== */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-500 mb-8">We typically respond within a few hours during business hours.</p>
              <ContactForm />
            </div>

            {/* ====== INFO SIDEBAR ====== */}
            <div className="space-y-6">
              {/* Open/Closed Indicator */}
              <div
                className={cn(
                  "inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold border",
                  isOpen
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )}
                />
                {isOpen ? "We're Open Now" : "Currently Closed"}
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-[var(--surface-alt)] rounded-xl p-5 border border-[var(--border)] transition-all duration-300 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
                      <span className="text-[#C9A84C] text-lg">&#128222;</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1">Phone</h3>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-gray-600 hover:text-[#C9A84C] transition-colors duration-300"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--surface-alt)] rounded-xl p-5 border border-[var(--border)] transition-all duration-300 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
                      <span className="text-[#C9A84C] text-lg">&#9993;</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1">Email</h3>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-gray-600 hover:text-[#C9A84C] transition-colors duration-300 break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--surface-alt)] rounded-xl p-5 border border-[var(--border)] sm:col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A84C]/10">
                      <span className="text-[#C9A84C] text-lg">&#128205;</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1">Address</h3>
                      <p className="text-gray-600">
                        {settings.address}
                        <br />
                        {settings.city}, {settings.state} {settings.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Hours */}
              <div className="bg-[var(--surface-alt)] rounded-xl p-6 border border-[var(--border)]">
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
                      <span
                        className={cn(
                          "font-medium",
                          h.closed ? "text-red-400" : "text-gray-600"
                        )}
                      >
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

      {/* ====== MAP ====== */}
      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Location</p>
            <h2 className="font-serif text-2xl font-bold text-[#1B2A4A]">
              Find Us
            </h2>
          </div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center shadow-inner border border-[var(--border)]">
            {settings.googleMapsEmbed ? (
              <div
                className="w-full h-full min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
              />
            ) : (
              <div className="text-center text-gray-400 p-8">
                <div className="text-5xl mb-3">&#128506;</div>
                <p className="text-lg font-medium">Google Maps</p>
                <p className="text-sm mt-1">Map embed will appear here once configured in admin settings</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
