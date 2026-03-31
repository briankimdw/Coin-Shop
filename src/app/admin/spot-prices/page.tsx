"use client";

import { useEffect, useState } from "react";
import {
  FaSave,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaChartLine,
} from "react-icons/fa";
import { formatPrice } from "@/lib/spot-prices";

interface SpotPrices {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
  updatedAt: string;
}

interface SpotSettings {
  autoFetchSpot: boolean;
  goldOverride: string;
  silverOverride: string;
  platinumOverride: string;
  palladiumOverride: string;
  goldBuyPremium: string;
  goldSellPremium: string;
  silverBuyPremium: string;
  silverSellPremium: string;
  platinumBuyPremium: string;
  platinumSellPremium: string;
  palladiumBuyPremium: string;
  palladiumSellPremium: string;
}

const METALS = ["gold", "silver", "platinum", "palladium"] as const;
type Metal = (typeof METALS)[number];

const defaultSpotSettings: SpotSettings = {
  autoFetchSpot: true,
  goldOverride: "",
  silverOverride: "",
  platinumOverride: "",
  palladiumOverride: "",
  goldBuyPremium: "0",
  goldSellPremium: "0",
  silverBuyPremium: "0",
  silverSellPremium: "0",
  platinumBuyPremium: "0",
  platinumSellPremium: "0",
  palladiumBuyPremium: "0",
  palladiumSellPremium: "0",
};

export default function SpotPricesPage() {
  const [livePrices, setLivePrices] = useState<SpotPrices | null>(null);
  const [settings, setSettings] = useState<SpotSettings>(defaultSpotSettings);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch live prices
    fetch("/api/spot-prices")
      .then((res) => res.json())
      .then((data) => setLivePrices(data))
      .catch(() => {})
      .finally(() => setLoadingPrices(false));

    // Fetch current settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          autoFetchSpot: data.autoFetchSpot ?? true,
          goldOverride: data.goldSpotOverride?.toString() || "",
          silverOverride: data.silverSpotOverride?.toString() || "",
          platinumOverride: data.platinumSpotOverride?.toString() || "",
          palladiumOverride: data.palladiumSpotOverride?.toString() || "",
          goldBuyPremium: data.goldBuyPremium?.toString() || "0",
          goldSellPremium: data.goldSellPremium?.toString() || "0",
          silverBuyPremium: data.silverBuyPremium?.toString() || "0",
          silverSellPremium: data.silverSellPremium?.toString() || "0",
          platinumBuyPremium: data.platinumBuyPremium?.toString() || "0",
          platinumSellPremium: data.platinumSellPremium?.toString() || "0",
          palladiumBuyPremium: data.palladiumBuyPremium?.toString() || "0",
          palladiumSellPremium: data.palladiumSellPremium?.toString() || "0",
        });
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const getSpotPrice = (metal: Metal): number => {
    const override = settings[`${metal}Override` as keyof SpotSettings];
    if (override && Number(override) > 0) return Number(override);
    return livePrices?.[metal] || 0;
  };

  const getBuyPrice = (metal: Metal): number => {
    const spot = getSpotPrice(metal);
    const premium = Number(
      settings[`${metal}BuyPremium` as keyof SpotSettings] || 0
    );
    return spot * (1 - premium / 100);
  };

  const getSellPrice = (metal: Metal): number => {
    const spot = getSpotPrice(metal);
    const premium = Number(
      settings[`${metal}SellPremium` as keyof SpotSettings] || 0
    );
    return spot * (1 + premium / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const payload: Record<string, unknown> = {
        autoFetchSpot: settings.autoFetchSpot,
        goldSpotOverride: settings.goldOverride ? Number(settings.goldOverride) : null,
        silverSpotOverride: settings.silverOverride ? Number(settings.silverOverride) : null,
        platinumSpotOverride: settings.platinumOverride ? Number(settings.platinumOverride) : null,
        palladiumSpotOverride: settings.palladiumOverride ? Number(settings.palladiumOverride) : null,
        goldBuyPremium: Number(settings.goldBuyPremium) || 0,
        goldSellPremium: Number(settings.goldSellPremium) || 0,
        silverBuyPremium: Number(settings.silverBuyPremium) || 0,
        silverSellPremium: Number(settings.silverSellPremium) || 0,
        platinumBuyPremium: Number(settings.platinumBuyPremium) || 0,
        platinumSellPremium: Number(settings.platinumSellPremium) || 0,
        palladiumBuyPremium: Number(settings.palladiumBuyPremium) || 0,
        palladiumSellPremium: Number(settings.palladiumSellPremium) || 0,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loadingPrices || loadingSettings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Spot Prices
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure metal pricing and premiums</p>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          Spot price settings saved successfully!
        </div>
      )}

      {/* Current Live Prices */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaChartLine className="text-[#C9A84C]" />
          <h2 className="text-sm font-semibold text-[#1B2A4A] uppercase tracking-wide">
            Current Live Prices
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {METALS.map((metal) => (
            <div
              key={metal}
              className="bg-gray-50 rounded-lg p-4 text-center"
            >
              <p className="text-xs text-gray-500 uppercase mb-1">
                {metal}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {livePrices ? formatPrice(livePrices[metal]) : "-"}
              </p>
            </div>
          ))}
        </div>
        {livePrices?.updatedAt && (
          <p className="text-xs text-gray-400 mt-3">
            Last updated: {new Date(livePrices.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Auto-fetch toggle */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  autoFetchSpot: !prev.autoFetchSpot,
                }))
              }
              className="text-3xl transition-colors"
            >
              {settings.autoFetchSpot ? (
                <FaToggleOn className="text-green-500" />
              ) : (
                <FaToggleOff className="text-gray-400" />
              )}
            </button>
            <div>
              <p className="font-medium text-gray-900">
                Auto-fetch Spot Prices
              </p>
              <p className="text-sm text-gray-500">
                Automatically fetch live spot prices from metals.live API
              </p>
            </div>
          </div>
        </div>

        {/* Manual Overrides */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 uppercase tracking-wide">
            Manual Overrides
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Leave empty to use live prices. Enter a value to override.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {METALS.map((metal) => (
              <div key={metal}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {metal} Spot Override
                </label>
                <input
                  type="number"
                  value={
                    settings[
                      `${metal}Override` as keyof SpotSettings
                    ] as string
                  }
                  onChange={(e) =>
                    handleChange(`${metal}Override`, e.target.value)
                  }
                  step="0.01"
                  min="0"
                  placeholder={
                    livePrices ? livePrices[metal].toString() : "0.00"
                  }
                  className="input-field w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Premiums */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 uppercase tracking-wide">
            Premiums
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Set buy (below spot) and sell (above spot) premium percentages.
          </p>
          <div className="space-y-4">
            {METALS.map((metal) => (
              <div
                key={metal}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
              >
                <div className="sm:flex sm:items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {metal}
                  </span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Buy Premium %
                  </label>
                  <input
                    type="number"
                    value={
                      settings[
                        `${metal}BuyPremium` as keyof SpotSettings
                      ] as string
                    }
                    onChange={(e) =>
                      handleChange(`${metal}BuyPremium`, e.target.value)
                    }
                    step="0.1"
                    min="0"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sell Premium %
                  </label>
                  <input
                    type="number"
                    value={
                      settings[
                        `${metal}SellPremium` as keyof SpotSettings
                      ] as string
                    }
                    onChange={(e) =>
                      handleChange(`${metal}SellPremium`, e.target.value)
                    }
                    step="0.1"
                    min="0"
                    className="input-field w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Table */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 uppercase tracking-wide">
            Price Preview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Metal
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Spot Price
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    We Buy At
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    We Sell At
                  </th>
                </tr>
              </thead>
              <tbody>
                {METALS.map((metal, idx) => (
                  <tr
                    key={metal}
                    className={`border-b border-gray-100 ${
                      idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                      {metal}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatPrice(getSpotPrice(metal))}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {formatPrice(getBuyPrice(metal))}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {formatPrice(getSellPrice(metal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSave />
            )}
            {saving ? "Saving..." : "Save Spot Price Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
