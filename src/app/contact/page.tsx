import prisma from "@/lib/prisma";
import { cn, parseJsonField, isCurrentlyOpen } from "@/lib/utils";
import ContactForm from "@/components/ContactForm";

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
      <section className="bg-[#1B2A4A] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have a question or want to sell your coins? Get in touch with us today.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ====== CONTACT FORM ====== */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-6">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>

            {/* ====== INFO SIDEBAR ====== */}
            <div className="space-y-8">
              {/* Open/Closed Indicator */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
                  isOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )}
                />
                {isOpen ? "We're Open Now" : "Currently Closed"}
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div
                  className={cn(
                    "bg-gray-50 rounded-xl p-5",
                    "border border-gray-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-[#C9A84C]">&#128222;</span>
                    <div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1">Phone</h3>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-gray-600 hover:text-[#C9A84C] transition-colors"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "bg-gray-50 rounded-xl p-5",
                    "border border-gray-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-[#C9A84C]">&#9993;</span>
                    <div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1">Email</h3>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-gray-600 hover:text-[#C9A84C] transition-colors break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "bg-gray-50 rounded-xl p-5",
                    "border border-gray-100",
                    "sm:col-span-2 lg:col-span-1"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl text-[#C9A84C]">&#128205;</span>
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
                      <span
                        className={cn(
                          h.closed
                            ? "text-red-500"
                            : "text-gray-600"
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-6 text-center">
            Find Us
          </h2>
          <div className="bg-gray-200 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
            {settings.googleMapsEmbed ? (
              <div
                className="w-full h-full min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
              />
            ) : (
              <div className="text-center text-gray-500 p-8">
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
