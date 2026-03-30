import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // --- Admin User ---
  const hashedPassword = await bcrypt.hash("changeme123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@coinshop.com" },
    update: {},
    create: {
      email: "admin@coinshop.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

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
  console.log(`✅ Store settings created: ${settings.shopName}`);

  // --- Coin Listings ---
  const coins = [
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
    {
      title: "2024 1 oz Gold American Buffalo MS-70",
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
      title: "1 oz PAMP Suisse Gold Bar",
      slug: "1oz-pamp-suisse-gold-bar",
      category: "Bullion",
      metal: "Gold",
      year: null,
      mintMark: null,
      grade: null,
      certification: "Raw",
      certNumber: null,
      description:
        "1 troy ounce PAMP Suisse gold bar in assay card featuring the iconic Lady Fortuna design. Struck from .9999 fine gold with a unique serial number and assay certificate. PAMP Suisse is one of the world's most recognized and trusted precious metals refiners.",
      costBasis: 2150,
      askingPrice: 2380,
      quantity: 5,
      featured: false,
      images: "[]",
    },
    {
      title: "10 oz Silver Bar .999",
      slug: "10-oz-silver-bar-999",
      category: "Bullion",
      metal: "Silver",
      year: null,
      mintMark: null,
      grade: null,
      certification: "Raw",
      certNumber: null,
      description:
        "10 troy ounce silver bar struck from .999 fine silver. A popular choice for investors looking to stack silver at low premiums. Each bar is stamped with weight, purity, and a unique serial number for authenticity verification.",
      costBasis: 250,
      askingPrice: 295,
      quantity: 20,
      featured: false,
      images: "[]",
    },
    {
      title: "1921 Peace Dollar MS-63",
      slug: "1921-peace-dollar-ms-63",
      category: "US Coins",
      metal: "Silver",
      year: 1921,
      mintMark: null,
      grade: "MS-63",
      certification: "PCGS",
      certNumber: "41829375",
      description:
        "The 1921 Peace Dollar is the first year of issue and features the high-relief design that was used only in this year. PCGS MS-63 with satiny white luster and sharp detail in Liberty's hair. A key date that is essential for any Peace Dollar collection.",
      costBasis: 350,
      askingPrice: 425,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "1955 Double Die Lincoln Cent AU-50 PCGS",
      slug: "1955-double-die-lincoln-cent-au-50-pcgs",
      category: "US Coins",
      metal: "Copper",
      year: 1955,
      mintMark: null,
      grade: "AU-50",
      certification: "PCGS",
      certNumber: "35718294",
      description:
        "The 1955 Doubled Die Lincoln Cent is one of the most dramatic and famous error coins in American numismatics. The obverse shows strong doubling visible to the naked eye on the date, LIBERTY, and IN GOD WE TRUST. This PCGS AU-50 example retains significant mint luster with light wear on the high points.",
      costBasis: 1400,
      askingPrice: 1650,
      quantity: 1,
      featured: true,
      images: "[]",
    },
    {
      title: "1804 Draped Bust Quarter AG-3",
      slug: "1804-draped-bust-quarter-ag-3",
      category: "US Coins",
      metal: "Silver",
      year: 1804,
      mintMark: null,
      grade: "AG-3",
      certification: "PCGS",
      certNumber: "19472835",
      description:
        "An early American quarter from 1804 featuring the elegant Draped Bust design with the Heraldic Eagle reverse. While heavily worn at AG-3, the date is still readable and the coin has a pleasing even appearance. Early type coins like this are increasingly difficult to find at any grade level.",
      costBasis: 700,
      askingPrice: 850,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "Ancient Roman Denarius Trajan 98-117 AD",
      slug: "ancient-roman-denarius-trajan-98-117-ad",
      category: "Ancients",
      metal: "Silver",
      year: 100,
      mintMark: null,
      grade: "VF",
      certification: "Raw",
      certNumber: null,
      description:
        "A silver denarius of Emperor Trajan, who ruled the Roman Empire at its greatest territorial extent from 98 to 117 AD. The obverse features a laureate bust of Trajan right, while the reverse depicts a standing figure. Well-centered with clear portrait details and an attractive cabinet tone.",
      costBasis: 200,
      askingPrice: 275,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "1928 $20 Gold Certificate VF-25",
      slug: "1928-20-gold-certificate-vf-25",
      category: "Paper Money",
      metal: null,
      year: 1928,
      mintMark: null,
      grade: "VF-25",
      certification: "Raw",
      certNumber: null,
      description:
        "A beautiful 1928 $20 Gold Certificate featuring Andrew Jackson on the obverse with the distinctive gold seal and serial numbers. These notes were redeemable in gold coin until 1933 and are highly collectible today. This example shows moderate circulation with crisp remaining detail and bright colors.",
      costBasis: 300,
      askingPrice: 385,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "2024 1 oz Platinum American Eagle BU",
      slug: "2024-1-oz-platinum-american-eagle-bu",
      category: "Bullion",
      metal: "Platinum",
      year: 2024,
      mintMark: null,
      grade: "BU",
      certification: "Raw",
      certNumber: null,
      description:
        "2024 Platinum American Eagle in Brilliant Uncirculated condition containing 1 troy ounce of .9995 fine platinum. Features the Statue of Liberty obverse and soaring eagle reverse. Platinum Eagles have lower mintages than their gold and silver counterparts, making them popular with both investors and collectors.",
      costBasis: 950,
      askingPrice: 1050,
      quantity: 3,
      featured: false,
      images: "[]",
    },
    {
      title: "1 oz Canadian Gold Maple Leaf",
      slug: "1oz-canadian-gold-maple-leaf",
      category: "Bullion",
      metal: "Gold",
      year: 2024,
      mintMark: null,
      grade: "BU",
      certification: "Raw",
      certNumber: null,
      description:
        "1 troy ounce Canadian Gold Maple Leaf struck in .9999 fine gold by the Royal Canadian Mint. Features Queen Elizabeth II on the obverse and the iconic maple leaf design on the reverse with advanced security features including micro-engraved laser mark. One of the purest gold bullion coins available worldwide.",
      costBasis: 2200,
      askingPrice: 2400,
      quantity: 5,
      featured: false,
      images: "[]",
    },
    {
      title: "1932-D Washington Quarter VG-8",
      slug: "1932-d-washington-quarter-vg-8",
      category: "US Coins",
      metal: "Silver",
      year: 1932,
      mintMark: "D",
      grade: "VG-8",
      certification: "PCGS",
      certNumber: "28391574",
      description:
        "The 1932-D Washington Quarter is the key date of the series with a mintage of only 436,800. This PCGS VG-8 example has a clear date and mintmark with honest even wear. A cornerstone coin for any Washington Quarter collection and always in strong demand.",
      costBasis: 95,
      askingPrice: 125,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "Confederate $100 Bill 1862",
      slug: "confederate-100-bill-1862",
      category: "Paper Money",
      metal: null,
      year: 1862,
      mintMark: null,
      grade: "VF",
      certification: "Raw",
      certNumber: null,
      description:
        "An authentic Confederate States of America $100 note from 1862, featuring a vignette of a train on the left and two female figures on the right. Confederate currency is a fascinating area of collecting that bridges numismatics and Civil War history. This example displays moderate circulation with no major damage.",
      costBasis: 350,
      askingPrice: 450,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "1878-CC Morgan Dollar VF-35",
      slug: "1878-cc-morgan-dollar-vf-35",
      category: "US Coins",
      metal: "Silver",
      year: 1878,
      mintMark: "CC",
      grade: "VF-35",
      certification: "NGC",
      certNumber: "5192847",
      description:
        "A first-year Carson City Morgan Dollar from 1878 graded VF-35 by NGC. The Carson City Mint operated from 1870 to 1893 and its coins are prized by collectors for their Western frontier provenance. This coin shows pleasing detail with light gray toning and no distracting marks.",
      costBasis: 260,
      askingPrice: 325,
      quantity: 1,
      featured: false,
      images: "[]",
    },
    {
      title: "5 oz Silver ATB Quarter Series",
      slug: "5-oz-silver-atb-quarter-series",
      category: "Bullion",
      metal: "Silver",
      year: 2023,
      mintMark: null,
      grade: "BU",
      certification: "Raw",
      certNumber: null,
      description:
        "5 troy ounce America the Beautiful silver bullion quarter from the U.S. Mint program that ran from 2010 to 2021. Struck in .999 fine silver, these large-format coins reproduce the national park quarter designs at a dramatic 3-inch diameter. A unique way to combine silver stacking with collecting.",
      costBasis: 140,
      askingPrice: 165,
      quantity: 8,
      featured: false,
      images: "[]",
    },
    {
      title: "World War II Japanese Invasion Money Set",
      slug: "world-war-ii-japanese-invasion-money-set",
      category: "World Coins",
      metal: null,
      year: 1942,
      mintMark: null,
      grade: "VF",
      certification: "Raw",
      certNumber: null,
      description:
        "A curated set of Japanese Invasion Money (JIM) notes issued during World War II for use in occupied territories including the Philippines, Burma, and the Dutch East Indies. These notes are an affordable and fascinating piece of WWII history. Set includes 5 different denominations in Very Fine or better condition.",
      costBasis: 30,
      askingPrice: 45,
      quantity: 10,
      featured: false,
      images: "[]",
    },
  ];

  let coinCount = 0;
  for (const coin of coins) {
    await prisma.coinListing.upsert({
      where: { slug: coin.slug },
      update: {},
      create: coin,
    });
    coinCount++;
  }
  console.log(`✅ ${coinCount} coin listings created`);

  // --- Testimonials ---
  const testimonials = [
    {
      name: "Robert M.",
      text: "Best coin shop in town! Fair prices and incredible knowledge.",
      rating: 5,
      featured: true,
    },
    {
      name: "Sarah L.",
      text: "Sold my father's collection here. They were honest and gave a great price.",
      rating: 5,
      featured: true,
    },
    {
      name: "Mike T.",
      text: "I've been buying silver here for years. Always competitive on premiums.",
      rating: 5,
      featured: true,
    },
    {
      name: "David K.",
      text: "The owner helped me identify a rare variety I didn't know I had.",
      rating: 4,
      featured: true,
    },
    {
      name: "Linda W.",
      text: "Professional, trustworthy, and a pleasure to do business with.",
      rating: 5,
      featured: true,
    },
  ];

  let testimonialCount = 0;
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
    testimonialCount++;
  }
  console.log(`✅ ${testimonialCount} testimonials created`);

  // --- Blog Posts ---
  const blogPosts = [
    {
      title: "Understanding Coin Grading: A Beginner's Guide",
      slug: "understanding-coin-grading-beginners-guide",
      content: `<h2>What Is Coin Grading?</h2>
<p>Coin grading is the process of evaluating a coin's condition on a standardized scale. The most widely used system is the Sheldon scale, which ranges from 1 (barely identifiable) to 70 (absolutely perfect). Understanding how grading works is essential for any collector because a coin's grade is one of the primary factors that determines its market value.</p>

<h2>The Sheldon Scale</h2>
<p>The Sheldon scale was originally developed by Dr. William Sheldon in 1949 for grading large cents. It has since been adopted as the universal standard for all U.S. coins. The scale is divided into major categories:</p>
<ul>
<li><strong>Poor (P-1) to Good (G-4-6):</strong> Heavily worn coins with major features visible but details largely gone.</li>
<li><strong>Very Good (VG-8-10) to Fine (F-12-15):</strong> Moderate wear with major details clear but some finer elements worn smooth.</li>
<li><strong>Very Fine (VF-20-35) to Extremely Fine (EF-40-45):</strong> Light to moderate wear on high points only; most details sharp.</li>
<li><strong>About Uncirculated (AU-50-58):</strong> Slight wear on the highest points; most mint luster remains.</li>
<li><strong>Mint State (MS-60-70):</strong> No wear whatsoever; differences based on luster, strike, and surface quality.</li>
</ul>

<h2>PCGS and NGC: Third-Party Grading</h2>
<p>The two most respected third-party grading services are the Professional Coin Grading Service (PCGS) and the Numismatic Guaranty Corporation (NGC). Both services employ expert graders who evaluate coins and encapsulate them in tamper-evident holders with the assigned grade. Having a coin graded by PCGS or NGC provides confidence in the grade and makes the coin easier to buy and sell sight-unseen.</p>

<h2>Why Grading Matters</h2>
<p>The difference of even a single grade point can mean hundreds or thousands of dollars in value for rare coins. For example, a Morgan Dollar in MS-64 might sell for $200, while the same coin in MS-65 could bring $500 or more. Learning to evaluate coins yourself is a valuable skill, but for expensive purchases, always look for coins graded by PCGS or NGC to protect your investment.</p>`,
      excerpt:
        "Learn the fundamentals of coin grading, from the Sheldon scale to PCGS and NGC certification, and why it matters for your collection.",
      published: true,
      author: "Admin",
      tags: JSON.stringify(["grading", "beginners", "PCGS", "NGC", "education"]),
    },
    {
      title: "Gold Market Update: What to Watch in 2024",
      slug: "gold-market-update-what-to-watch-2024",
      content: `<h2>Gold Prices at Historic Highs</h2>
<p>Gold has been making headlines as prices reach new all-time highs, driven by a combination of geopolitical uncertainty, central bank buying, and inflation concerns. For coin collectors and precious metals investors alike, understanding the forces behind gold's price movements is critical for making informed buying and selling decisions.</p>

<h2>Central Bank Demand</h2>
<p>One of the most significant drivers of gold prices has been unprecedented buying by central banks worldwide. Countries including China, India, Turkey, and Poland have been aggressively adding to their gold reserves as they seek to diversify away from the U.S. dollar. This institutional demand provides a strong floor for gold prices and has been a key factor in the metal's sustained upward trend.</p>

<h2>What This Means for Collectors</h2>
<p>Rising gold prices have a direct impact on numismatic coins with gold content. Pre-1933 U.S. gold coins, Gold Eagles, and Gold Buffalos all see their base value increase when spot prices rise. However, it is important to distinguish between a coin's melt value and its numismatic premium. Key-date and high-grade coins often maintain their premiums regardless of spot price movements, making them attractive holdings in any market environment.</p>

<h2>Looking Ahead</h2>
<p>Most analysts expect gold to remain well-supported through the remainder of 2024 and into 2025. Factors to watch include Federal Reserve interest rate decisions, U.S. dollar strength, and ongoing geopolitical tensions. For investors, dollar-cost averaging into gold bullion positions remains a prudent strategy, while collectors should focus on acquiring quality numismatic pieces that offer both intrinsic metal value and collectible premiums.</p>`,
      excerpt:
        "An overview of gold market trends, central bank buying, and what rising prices mean for coin collectors and precious metals investors.",
      published: true,
      author: "Admin",
      tags: JSON.stringify(["gold", "market update", "investing", "bullion"]),
    },
    {
      title: "5 Tips for Starting a Coin Collection",
      slug: "5-tips-for-starting-a-coin-collection",
      content: `<h2>1. Start with What Interests You</h2>
<p>The most important rule in coin collecting is to collect what you enjoy. Whether you are drawn to the beauty of Morgan Dollars, the history of ancient coins, or the modern appeal of American Eagles, your collection should reflect your personal interests. Collectors who are passionate about their focus area tend to learn more, make better purchases, and enjoy the hobby for a lifetime.</p>

<h2>2. Buy the Book Before the Coin</h2>
<p>Before spending money on coins, invest in knowledge. The "Red Book" (A Guide Book of United States Coins) is an essential reference for any U.S. coin collector. Online resources like PCGS CoinFacts and NGC Coin Explorer provide detailed information about mintages, values, and varieties. Understanding what you are buying will help you avoid overpaying and recognize good deals when you see them.</p>

<h2>3. Quality Over Quantity</h2>
<p>It is tempting to buy many inexpensive coins, but experienced collectors will tell you that fewer, higher-quality coins make a better collection. A single coin in MS-65 will almost always outperform ten coins in VG-8 over time, both in enjoyment and investment return. Set a budget and focus on acquiring the best examples you can afford within your chosen area.</p>

<h2>4. Build Relationships with Reputable Dealers</h2>
<p>A trusted local coin dealer is one of your greatest assets as a collector. Good dealers will help you learn, offer fair prices, and alert you when coins matching your interests become available. Look for dealers who are members of the American Numismatic Association (ANA) and the Professional Numismatists Guild (PNG) as indicators of ethical business practices.</p>

<h2>5. Protect Your Investment</h2>
<p>Proper storage and handling are essential for preserving your coins' condition and value. Always hold coins by the edges, store them in archival-quality holders, and keep your collection in a cool, dry environment. For valuable coins, consider having them graded and encapsulated by PCGS or NGC, which provides both authentication and physical protection. Finally, maintain an inventory of your collection with photos and purchase records for insurance purposes.</p>`,
      excerpt:
        "Essential advice for new coin collectors, from choosing a focus area to protecting your investment and building dealer relationships.",
      published: true,
      author: "Admin",
      tags: JSON.stringify([
        "collecting",
        "beginners",
        "tips",
        "education",
      ]),
    },
  ];

  let blogCount = 0;
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
    blogCount++;
  }
  console.log(`✅ ${blogCount} blog posts created`);

  // --- Summary ---
  console.log("\n📊 Seed Summary:");
  console.log(`   Users: 1`);
  console.log(`   Store Settings: 1`);
  console.log(`   Coin Listings: ${coinCount}`);
  console.log(`   Testimonials: ${testimonialCount}`);
  console.log(`   Blog Posts: ${blogCount}`);
  console.log("\n✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
