import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

async function getSettings() {
  let settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: { id: "default" } });
  }
  return settings;
}

const whyChooseUs = [
  {
    title: "Experience",
    description:
      "Decades of expertise in numismatics, bullion, and precious metals trading. Our knowledge ensures you get accurate valuations.",
    icon: "\u{1F3C6}",
  },
  {
    title: "Fair Prices",
    description:
      "We offer competitive buy and sell prices based on real-time market data. No hidden fees, no surprises.",
    icon: "\u{1F4B0}",
  },
  {
    title: "Authentication",
    description:
      "Every coin is carefully examined and authenticated. We work with PCGS, NGC, and other leading grading services.",
    icon: "\u{1F50D}",
  },
  {
    title: "Community",
    description:
      "We're proud members of the numismatic community and love helping new collectors get started on their journey.",
    icon: "\u{1F91D}",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  const aboutText =
    settings.aboutText ||
    "We are a family-owned coin shop dedicated to serving collectors and investors in our community. With decades of experience in numismatics, we pride ourselves on offering fair prices, expert knowledge, and a welcoming environment for both seasoned collectors and newcomers alike. Our passion for coins and precious metals drives us to provide the best possible service to every customer who walks through our doors.";

  const ownerBio =
    settings.ownerBio ||
    "Our founder has been passionate about coins and precious metals for over 25 years. Starting as a young collector, they turned a lifelong hobby into a thriving business built on trust, knowledge, and a genuine love for numismatics. They are active members of the American Numismatic Association and regularly attend major coin shows across the country.";

  return (
    <>
      {/* ====== HERO BANNER ====== */}
      <section className="page-hero py-16 md:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            About Us
          </h1>
          <p className="text-[#FAF7F0]/60 text-lg max-w-2xl mx-auto">
            Your trusted partner in coins, bullion, and precious metals
          </p>
        </div>
      </section>

      {/* ====== OUR STORY ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Heritage</p>
              <h2 className="font-serif text-3xl font-bold text-[#1B2A4A] mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed text-[17px]">
                  {aboutText}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl aspect-video flex items-center justify-center border border-[var(--border)]">
              <div className="text-center text-gray-400 p-8">
                <div className="text-6xl mb-3">&#127963;</div>
                <p className="text-sm font-medium">Shop photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== OWNER BIO + YEARS ====== */}
      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl w-72 h-72 flex items-center justify-center border border-[var(--border)]">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-2">&#128100;</div>
                  <p className="text-sm font-medium">Owner photo</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Leadership</p>
              <h2 className="font-serif text-3xl font-bold text-[#1B2A4A] mb-3">
                Meet the Owner
              </h2>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6",
                  "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                {settings.yearsInBusiness} Years in Business
              </div>
              <p className="text-gray-600 leading-relaxed text-[17px]">
                {ownerBio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== MEMBERSHIPS ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Credentials</p>
          <h2 className="font-serif text-3xl font-bold text-[#1B2A4A] mb-10">
            Professional Memberships
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div
              className={cn(
                "bg-[var(--surface-alt)] rounded-2xl p-8 w-52",
                "border border-[var(--border)]",
                "flex flex-col items-center gap-4",
                "transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/5 hover:-translate-y-1"
              )}
            >
              <div className="w-20 h-20 bg-[#C9A84C]/10 rounded-full flex items-center justify-center border border-[#C9A84C]/20">
                <span className="text-2xl font-bold text-[#C9A84C] font-serif">ANA</span>
              </div>
              <p className="text-sm font-medium text-gray-600 text-center">
                American Numismatic Association
              </p>
            </div>
            <div
              className={cn(
                "bg-[var(--surface-alt)] rounded-2xl p-8 w-52",
                "border border-[var(--border)]",
                "flex flex-col items-center gap-4",
                "transition-all duration-400 hover:shadow-xl hover:shadow-[#1B2A4A]/5 hover:-translate-y-1"
              )}
            >
              <div className="w-20 h-20 bg-[#C9A84C]/10 rounded-full flex items-center justify-center border border-[#C9A84C]/20">
                <span className="text-2xl font-bold text-[#C9A84C] font-serif">PNG</span>
              </div>
              <p className="text-sm font-medium text-gray-600 text-center">
                Professional Numismatists Guild
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== WHY CHOOSE US ====== */}
      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Our Promise</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Here&apos;s what sets us apart from the competition
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className={cn(
                  "bg-white rounded-2xl p-7 text-center",
                  "border border-[var(--border)]",
                  "hover:border-[#C9A84C]/30 hover:shadow-xl hover:shadow-[#C9A84C]/5 transition-all duration-400 hover:-translate-y-1"
                )}
              >
                <div className="w-14 h-14 mx-auto bg-[#C9A84C]/10 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1B2A4A] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
