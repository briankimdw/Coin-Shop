import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

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
      <section className="bg-[#1B2A4A] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            About Us
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Your trusted partner in coins, bullion, and precious metals
          </p>
        </div>
      </section>

      {/* ====== OUR STORY ====== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1B2A4A] mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {aboutText}
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-gray-500 p-8">
                <div className="text-6xl mb-3">&#127963;</div>
                <p className="text-sm">Shop photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== OWNER BIO + YEARS ====== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-200 rounded-xl w-64 h-64 mx-auto flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-2">&#128100;</div>
                  <p className="text-sm">Owner photo</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-3xl font-bold text-[#1B2A4A] mb-2">
                Meet the Owner
              </h2>
              <div
                className={cn(
                  "inline-block px-4 py-1 rounded-full text-sm font-semibold mb-6",
                  "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30"
                )}
              >
                {settings.yearsInBusiness} Years in Business
              </div>
              <p className="text-gray-700 leading-relaxed">
                {ownerBio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== MEMBERSHIPS ====== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#1B2A4A] mb-8">
            Professional Memberships
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div
              className={cn(
                "bg-gray-50 rounded-xl p-6 w-48",
                "border border-gray-100",
                "flex flex-col items-center gap-3"
              )}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-[#1B2A4A]">ANA</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                American Numismatic Association
              </p>
            </div>
            <div
              className={cn(
                "bg-gray-50 rounded-xl p-6 w-48",
                "border border-gray-100",
                "flex flex-col items-center gap-3"
              )}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-[#1B2A4A]">PNG</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Professional Numismatists Guild
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== WHY CHOOSE US ====== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-3">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here&apos;s what sets us apart from the competition
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className={cn(
                  "bg-white rounded-xl p-6 text-center",
                  "border border-gray-100",
                  "hover:border-[#C9A84C]/50 hover:shadow-lg transition-all duration-300"
                )}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-serif text-lg font-bold text-[#1B2A4A] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
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
