import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // --- Admin User ---
  // Default password: admin123 (change immediately after first login)
  const admin = await prisma.user.upsert({
    where: { email: "admin@coinshop.com" },
    update: {},
    create: {
      email: "admin@coinshop.com",
      password: "$2b$10$67F3.vTJi9Ld7APWiYhd7.5bsOxGbpWMCVu48dlwcjoHNvDt/57a2",
      name: "Admin",
      role: "admin",
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // --- Store Settings ---
  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      shopName: "Liberty Coin & Precious Metals",
      tagline: "Your Trusted Local Coin Dealer Since 1998",
      address: "742 Numismatic Way",
      city: "Springfield",
      state: "IL",
      zip: "62701",
      phone: "(217) 555-2683",
      email: "info@libertycoinshop.com",
      heroTitle: "Buy, Sell & Trade Coins & Precious Metals",
      heroSubtitle:
        "Serving collectors and investors for over 25 years with honest dealings and expert knowledge",
      aboutText:
        "Liberty Coin & Precious Metals has been a cornerstone of the Springfield numismatic community since 1998. We specialize in U.S. coins, world coins, bullion, and paper currency. Whether you are a seasoned collector or just getting started, our knowledgeable staff is here to help you find exactly what you are looking for.",
      ownerBio:
        "With over 30 years of experience in numismatics, our owner has built Liberty Coin into one of the most respected coin shops in the region. A life member of the ANA and PNG, he brings deep expertise and a commitment to fair dealing to every transaction.",
      yearsInBusiness: "25+",
      memberships: JSON.stringify([
        "American Numismatic Association (ANA)",
        "Professional Numismatists Guild (PNG)",
        "Illinois Numismatic Association (ILNA)",
        "Better Business Bureau (A+ Rating)",
      ]),
      isOpen: true,
      socialFacebook: "https://facebook.com/libertycoinshop",
      socialInstagram: "https://instagram.com/libertycoinshop",
      socialTwitter: "https://twitter.com/libertycoinshop",
      autoFetchSpot: true,
      goldBuyPremium: -5,
      goldSellPremium: 5,
      silverBuyPremium: -10,
      silverSellPremium: 15,
      platinumBuyPremium: -5,
      platinumSellPremium: 10,
      palladiumBuyPremium: -5,
      palladiumSellPremium: 10,
    },
  });
  console.log(`Store settings created: ${settings.shopName}`);

  // --- Appointment Settings ---
  const appointmentSettings = await prisma.appointmentSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      slotDurationMin: 30,
      maxPerSlot: 1,
      advanceBookDays: 30,
      appointmentTypes: JSON.stringify([
        "Appraisal",
        "Sell Coins",
        "Buy Consultation",
        "Collection Review",
        "Estate Evaluation",
      ]),
      blockedDates: "[]",
    },
  });
  console.log(`Appointment settings created: ${appointmentSettings.id}`);

  // --- FAQ Entries ---
  const faqs: Array<{
    question: string;
    answer: string;
    sortOrder: number;
    published: boolean;
  }> = [
    {
      question: "How do you determine the value of my coins?",
      answer:
        "We evaluate coins based on several factors: the current precious metal spot price, numismatic rarity, condition/grade, market demand, and certification status. We use industry-standard references including the PCGS and NGC price guides, recent auction results, and our decades of market experience. For certified coins, we can provide a quote on the spot. For raw coins or larger collections, we may need to examine them in person.",
      sortOrder: 0,
      published: true,
    },
    {
      question: "Do I need an appointment to sell my coins?",
      answer:
        "Walk-ins are welcome for small transactions and browsing our inventory. However, we strongly recommend scheduling an appointment if you have a large collection, estate, or want dedicated one-on-one time with our numismatist. Appointments ensure we can give your coins the time and attention they deserve. You can book online through our appointments page or call us directly.",
      sortOrder: 1,
      published: true,
    },
    {
      question: "What types of coins and precious metals do you buy?",
      answer:
        "We buy virtually all coins and precious metals including: U.S. coins (common and rare), world and ancient coins, gold and silver bullion (bars, rounds, and coins), platinum and palladium, paper currency, gold and silver jewelry, and complete or partial collections. If it is made of precious metal or has numismatic value, we are interested. Bring it in or contact us for a free evaluation.",
      sortOrder: 2,
      published: true,
    },
    {
      question: "Are your coins certified and guaranteed authentic?",
      answer:
        "Many of our coins are certified by PCGS (Professional Coin Grading Service) or NGC (Numismatic Guaranty Corporation), the two most respected third-party grading services. Certified coins come sealed in tamper-evident holders with a grade and authenticity guarantee. For raw (uncertified) coins, we stand behind every item we sell with our own guarantee of authenticity. If any coin we sell is found to be inauthentic, we will provide a full refund.",
      sortOrder: 3,
      published: true,
    },
    {
      question: "How are your prices determined for buying and selling?",
      answer:
        "Our buy and sell prices are based on live precious metal spot prices plus a small premium. For bullion items, premiums are clearly listed and competitive with national dealers. For numismatic (collector) coins, prices reflect current market values from major auction houses and dealer networks. We update our prices regularly to ensure you get a fair deal whether you are buying or selling. Check our spot price bar at the top of the site for current metal prices.",
      sortOrder: 4,
      published: true,
    },
  ];

  for (const faq of faqs) {
    // Use question as a unique identifier for idempotent seeding
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }
  console.log(`${faqs.length} FAQ entries seeded`);

  // --- Testimonials ---
  const testimonials: Array<{
    name: string;
    text: string;
    rating: number;
    featured: boolean;
  }> = [
    {
      name: "Robert M.",
      text: "Best coin shop in town. Fair prices and incredible knowledge. I have been coming here for over ten years and have never been disappointed with a purchase or a payout.",
      rating: 5,
      featured: true,
    },
    {
      name: "Sarah L.",
      text: "Sold my father's coin collection here after he passed. They were patient, thorough, and gave me a very fair price. I appreciated how they explained the value of each piece rather than just offering a lump sum.",
      rating: 5,
      featured: true,
    },
    {
      name: "Mike T.",
      text: "I have been stacking silver here for years. Their premiums are always competitive with the big online dealers, and I get to inspect everything in person before buying. Great selection of bullion and numismatic coins.",
      rating: 5,
      featured: true,
    },
    {
      name: "David K.",
      text: "The owner spotted a rare die variety in a coin I brought in that I had no idea about. His expertise literally saved me from selling it at melt value. That kind of honesty keeps me coming back.",
      rating: 5,
      featured: true,
    },
    {
      name: "Linda W.",
      text: "Professional, trustworthy, and a pleasure to do business with. I started collecting coins as a hobby and the staff here helped me understand grading, storage, and what to look for. Highly recommend.",
      rating: 5,
      featured: true,
    },
    {
      name: "James P.",
      text: "Brought in a box of old coins from my grandparents' attic not knowing what any of it was worth. They took the time to go through everything piece by piece and gave me a fair written offer. No pressure at all.",
      rating: 4,
      featured: true,
    },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
    }
  }
  console.log(`${testimonials.length} testimonials seeded`);

  // --- Sample Inventory (6 coins) ---
  const coins: Array<{
    title: string;
    slug: string;
    category: string;
    metal: string | null;
    year: number | null;
    mintMark: string | null;
    grade: string | null;
    certification: string | null;
    certNumber: string | null;
    description: string;
    costBasis: number | null;
    askingPrice: number;
    quantity: number;
    featured: boolean;
    images: string;
  }> = [
    {
      title: "1893-S Morgan Silver Dollar MS-63 PCGS",
      slug: "1893-s-morgan-silver-dollar-ms-63-pcgs",
      category: "US Coins",
      metal: "Silver",
      year: 1893,
      mintMark: "S",
      grade: "MS-63",
      certification: "PCGS",
      certNumber: "38294751",
      description:
        "The 1893-S Morgan Dollar is the undisputed key date of the Morgan Dollar series with a mintage of only 100,000 coins. This example grades MS-63 by PCGS and displays beautiful original toning with strong luster. An exceptional opportunity for the serious Morgan collector.",
      costBasis: 3600,
      askingPrice: 4250,
      quantity: 1,
      featured: true,
      images: "[]",
    },
    {
      title: "1927 Saint-Gaudens Double Eagle Gold MS-65 NGC",
      slug: "1927-saint-gaudens-double-eagle-gold-ms-65-ngc",
      category: "US Coins",
      metal: "Gold",
      year: 1927,
      mintMark: null,
      grade: "MS-65",
      certification: "NGC",
      certNumber: "5847291",
      description:
        "A stunning Gem Mint State example of the 1927 Saint-Gaudens Double Eagle, widely considered the most beautiful coin design in American history. NGC has graded this piece MS-65 with full satin luster and minimal contact marks. Contains 0.9675 oz of pure gold.",
      costBasis: 3200,
      askingPrice: 3800,
      quantity: 1,
      featured: true,
      images: "[]",
    },
    {
      title: "2024 American Silver Eagle BU",
      slug: "2024-american-silver-eagle-bu",
      category: "Bullion",
      metal: "Silver",
      year: 2024,
      mintMark: null,
      grade: "BU",
      certification: "Raw",
      certNumber: null,
      description:
        "Brand new 2024 American Silver Eagle in Brilliant Uncirculated condition. Contains 1 troy ounce of .999 fine silver with the iconic Walking Liberty obverse and heraldic eagle reverse. A must-have for any bullion investor or collector.",
      costBasis: 32,
      askingPrice: 38,
      quantity: 50,
      featured: false,
      images: "[]",
    },
    {
      title: "1909-S VDB Lincoln Cent VF-30 PCGS",
      slug: "1909-s-vdb-lincoln-cent-vf-30-pcgs",
      category: "US Coins",
      metal: "Copper",
      year: 1909,
      mintMark: "S",
      grade: "VF-30",
      certification: "PCGS",
      certNumber: "29184756",
      description:
        "The legendary 1909-S VDB Lincoln Cent is one of the most sought-after coins in American numismatics. With a mintage of only 484,000, this key date carries Victor David Brenner's initials on the reverse. PCGS VF-30 with pleasing chocolate brown surfaces and clear VDB lettering.",
      costBasis: 950,
      askingPrice: 1150,
      quantity: 1,
      featured: true,
      images: "[]",
    },
    {
      title: "2024 1 oz Gold American Buffalo MS-70 NGC",
      slug: "2024-1-oz-gold-american-buffalo-ms-70",
      category: "Bullion",
      metal: "Gold",
      year: 2024,
      mintMark: null,
      grade: "MS-70",
      certification: "NGC",
      certNumber: "6938271",
      description:
        "A perfect MS-70 example of the 2024 Gold American Buffalo, struck in 1 troy ounce of .9999 fine gold. The Buffalo design by James Earle Fraser is one of the most iconic in American coinage. NGC has certified this coin as flawless with no visible marks under magnification.",
      costBasis: 2200,
      askingPrice: 2450,
      quantity: 3,
      featured: true,
      images: "[]",
    },
    {
      title: "1916-D Mercury Dime VG-8 NGC",
      slug: "1916-d-mercury-dime-vg-8-ngc",
      category: "US Coins",
      metal: "Silver",
      year: 1916,
      mintMark: "D",
      grade: "VG-8",
      certification: "NGC",
      certNumber: "4729185",
      description:
        "The 1916-D Mercury Dime is the key date of the series with a mintage of just 264,000. This NGC VG-8 example shows a clear date and mintmark with honest, even wear. A solid, affordable example of this classic rarity for the type collector.",
      costBasis: 1500,
      askingPrice: 1800,
      quantity: 1,
      featured: true,
      images: "[]",
    },
  ];

  for (const coin of coins) {
    await prisma.coinListing.upsert({
      where: { slug: coin.slug },
      update: {},
      create: coin,
    });
  }
  console.log(`${coins.length} coin listings seeded`);

  // --- Summary ---
  console.log("\nSeed Summary:");
  console.log("  Admin user: admin@coinshop.com / admin123");
  console.log("  Store settings: 1");
  console.log("  Appointment settings: 1");
  console.log(`  FAQ entries: ${faqs.length}`);
  console.log(`  Testimonials: ${testimonials.length}`);
  console.log(`  Coin listings: ${coins.length}`);
  console.log("\nDatabase seeding complete!");
  console.log("IMPORTANT: Change the admin password after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
