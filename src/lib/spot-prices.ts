export interface SpotPrices {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
  updatedAt: string;
}

// Fetches live spot prices from metals.live (free, no API key)
export async function fetchSpotPrices(): Promise<SpotPrices> {
  try {
    const res = await fetch("https://api.metals.live/v1/spot", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) throw new Error("Failed to fetch spot prices");

    const data = await res.json();

    // metals.live returns an array of objects
    const prices: SpotPrices = {
      gold: 0,
      silver: 0,
      platinum: 0,
      palladium: 0,
      updatedAt: new Date().toISOString(),
    };

    for (const item of data) {
      if (item.gold) prices.gold = item.gold;
      if (item.silver) prices.silver = item.silver;
      if (item.platinum) prices.platinum = item.platinum;
      if (item.palladium) prices.palladium = item.palladium;
    }

    return prices;
  } catch {
    // Fallback prices if API is down
    return {
      gold: 2350.0,
      silver: 28.5,
      platinum: 985.0,
      palladium: 1050.0,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}
