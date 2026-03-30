import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import prisma from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

async function getShopName(): Promise<string> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: { shopName: true },
    });
    return settings?.shopName || "Coin Shop";
  } catch {
    return "Coin Shop";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const shopName = await getShopName();
  return {
    title: {
      default: `${shopName} | Buy, Sell & Appraise Coins`,
      template: `%s | ${shopName}`,
    },
    description:
      "Your trusted local coin shop specializing in rare coins, bullion, currency, and professional appraisal services. Buy, sell, and trade with confidence.",
    keywords: [
      "coin shop",
      "rare coins",
      "gold coins",
      "silver coins",
      "bullion",
      "coin appraisal",
      "numismatics",
      "coin dealer",
      "buy coins",
      "sell coins",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: shopName,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
