// ============================================================
// SHOP CONFIGURATION
// Change these values to reskin for a different coin shop.
// ============================================================

export const shopConfig = {
  // These are defaults — they get overridden by StoreSettings in DB
  name: "My Coin Shop",
  tagline: "Your Trusted Local Coin Dealer",
  address: "123 Main Street",
  city: "Springfield",
  state: "IL",
  zip: "62701",
  phone: "(555) 555-5555",
  email: "info@coinshop.com",
  url: "https://www.yourcoinshop.com",

  // Categories available in inventory
  categories: [
    "US Coins",
    "World Coins",
    "Bullion",
    "Paper Money",
    "Ancients",
    "Tokens & Medals",
  ],

  metals: ["Gold", "Silver", "Copper", "Platinum", "Palladium", "Other"],

  grades: [
    "AG-3", "G-4", "G-6", "VG-8", "VG-10",
    "F-12", "F-15", "VF-20", "VF-25", "VF-30", "VF-35",
    "EF-40", "EF-45",
    "AU-50", "AU-53", "AU-55", "AU-58",
    "MS-60", "MS-61", "MS-62", "MS-63", "MS-64", "MS-65",
    "MS-66", "MS-67", "MS-68", "MS-69", "MS-70",
    "PF-60", "PF-63", "PF-64", "PF-65", "PF-66", "PF-67",
    "PF-68", "PF-69", "PF-70",
    "Ungraded",
  ],

  certServices: ["PCGS", "NGC", "ANACS", "ICG", "Raw"],

  // Services the shop offers
  services: [
    { name: "Coins", icon: "coins", description: "US & World coins, ancient to modern" },
    { name: "Bullion", icon: "bullion", description: "Gold, silver, and platinum bars & rounds" },
    { name: "Jewelry", icon: "jewelry", description: "Gold, silver, and platinum jewelry" },
    { name: "Currency", icon: "currency", description: "Paper money, notes, and certificates" },
    { name: "Collections", icon: "collections", description: "Full and partial coin collections" },
    { name: "Estates", icon: "estates", description: "Estate liquidation and evaluation" },
  ],

  // Payout estimator defaults (percentage of spot)
  payoutEstimates: {
    "Gold Coin": { min: 92, max: 97 },
    "Gold Bar": { min: 95, max: 98 },
    "Gold Jewelry": { min: 70, max: 85 },
    "Silver Coin": { min: 85, max: 95 },
    "Silver Bar": { min: 88, max: 95 },
    "Silver Jewelry": { min: 60, max: 80 },
    "Platinum Coin": { min: 90, max: 96 },
    "Platinum Bar": { min: 92, max: 97 },
    "Palladium": { min: 88, max: 95 },
  } as Record<string, { min: number; max: number }>,

  // Social links (override from admin)
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

export type ShopConfig = typeof shopConfig;
