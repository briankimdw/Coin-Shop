import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchSpotPrices } from "@/lib/spot-prices";

export async function GET() {
  try {
    // Fetch store settings to check autoFetchSpot and overrides
    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    let gold = 0;
    let silver = 0;
    let platinum = 0;
    let palladium = 0;
    let updatedAt = new Date().toISOString();

    if (settings.autoFetchSpot) {
      const spotPrices = await fetchSpotPrices();
      gold = spotPrices.gold;
      silver = spotPrices.silver;
      platinum = spotPrices.platinum;
      palladium = spotPrices.palladium;
      updatedAt = spotPrices.updatedAt;
    }

    // Apply manual overrides from settings
    if (settings.goldSpotOverride !== null) gold = settings.goldSpotOverride;
    if (settings.silverSpotOverride !== null) silver = settings.silverSpotOverride;
    if (settings.platinumSpotOverride !== null) platinum = settings.platinumSpotOverride;
    if (settings.palladiumSpotOverride !== null) palladium = settings.palladiumSpotOverride;

    return NextResponse.json({
      gold,
      silver,
      platinum,
      palladium,
      updatedAt,
      prices: [
        { metal: "Gold", price: gold },
        { metal: "Silver", price: silver },
        { metal: "Platinum", price: platinum },
        { metal: "Palladium", price: palladium },
      ],
    });
  } catch (error) {
    console.error("Error fetching spot prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch spot prices" },
      { status: 500 }
    );
  }
}
