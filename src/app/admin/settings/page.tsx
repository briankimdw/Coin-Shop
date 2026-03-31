"use client";

import { useEffect, useState } from "react";
import {
  FaSave,
  FaSpinner,
  FaTimes,
  FaUpload,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface HoursEntry {
  open: string;
  close: string;
  closed: boolean;
}

interface Settings {
  shopName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  logo: string;
  banner: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  ownerBio: string;
  yearsInBusiness: string;
  memberships: string;
  hours: HoursEntry[];
  facebook: string;
  instagram: string;
  twitter: string;
  googleMapsUrl: string;
  googleMapsEmbed: string;
  googlePlaceId: string;
  googleApiKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  isOpen: boolean;
}

const defaultHours: HoursEntry[] = DAYS.map(() => ({
  open: "09:00",
  close: "17:00",
  closed: false,
}));

const defaultSettings: Settings = {
  shopName: "",
  tagline: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  logo: "",
  banner: "",
  heroTitle: "",
  heroSubtitle: "",
  aboutText: "",
  ownerBio: "",
  yearsInBusiness: "",
  memberships: "",
  hours: defaultHours,
  facebook: "",
  instagram: "",
  twitter: "",
  googleMapsUrl: "",
  googleMapsEmbed: "",
  googlePlaceId: "",
  googleApiKey: "",
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  isOpen: true,
};

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <span className="font-semibold text-sm text-[#1B2A4A]">
          {title}
        </span>
        {open ? (
          <HiChevronDown className="text-gray-400" />
        ) : (
          <HiChevronRight className="text-gray-400" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-2 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        // Map DB fields to form fields
        let parsedHours = defaultHours;
        if (data.hoursJson) {
          try {
            const h = JSON.parse(data.hoursJson);
            if (Array.isArray(h) && h.length === 7) {
              parsedHours = h.map((entry: { open?: string; close?: string; closed?: boolean }) => ({
                open: entry.open || "09:00",
                close: entry.close || "17:00",
                closed: entry.closed || false,
              }));
            }
          } catch { /* use defaults */ }
        }
        let memberships = "";
        if (data.memberships) {
          try {
            const m = JSON.parse(data.memberships);
            memberships = Array.isArray(m) ? m.join("\n") : data.memberships;
          } catch { memberships = data.memberships; }
        }
        setSettings({
          shopName: data.shopName || "",
          tagline: data.tagline || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          phone: data.phone || "",
          email: data.email || "",
          logo: data.logo || "",
          banner: data.bannerImage || "",
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          aboutText: data.aboutText || "",
          ownerBio: data.ownerBio || "",
          yearsInBusiness: data.yearsInBusiness || "",
          memberships,
          hours: parsedHours,
          facebook: data.socialFacebook || "",
          instagram: data.socialInstagram || "",
          twitter: data.socialTwitter || "",
          googleMapsUrl: data.googleMapsUrl || "",
          googleMapsEmbed: data.googleMapsEmbed || "",
          googlePlaceId: data.googlePlaceId || "",
          googleApiKey: data.googleApiKey || "",
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort || "",
          smtpUser: data.smtpUser || "",
          smtpPass: data.smtpPass || "",
          smtpFrom: data.smtpFrom || "",
          isOpen: data.isOpen ?? true,
        });
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleHoursChange = (
    index: number,
    field: keyof HoursEntry,
    value: string | boolean
  ) => {
    setSettings((prev) => {
      const hours = [...prev.hours];
      hours[index] = { ...hours[index], [field]: value };
      return { ...prev, hours };
    });
  };

  const handleFileChange = (
    type: "logo" | "banner",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(result);
      } else {
        setBannerFile(file);
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      // Append all settings as JSON
      formData.append("settings", JSON.stringify(settings));
      if (logoFile) formData.append("logo", logoFile);
      if (bannerFile) formData.append("banner", bannerFile);

      const res = await fetch("/api/settings", {
        method: "PUT",
        body: formData,
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

  if (loading) {
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
          Store Settings
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure your shop details and preferences</p>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          Settings saved successfully!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-3xl"
      >
        {/* Store Info */}
        <Section title="Store Info" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                name="shopName"
                value={settings.shopName}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={settings.state}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP
              </label>
              <input
                type="text"
                name="zip"
                value={settings.zip}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
          </div>
        </Section>

        {/* Branding */}
        <Section title="Branding">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              {(logoPreview || settings.logo) && (
                <div className="relative inline-block mb-3">
                  <img
                    src={logoPreview || settings.logo}
                    alt="Logo"
                    className="h-16 object-contain rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      setSettings((prev) => ({ ...prev, logo: "" }));
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <FaUpload />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("logo", e)}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              {(bannerPreview || settings.banner) && (
                <div className="relative inline-block mb-3">
                  <img
                    src={bannerPreview || settings.banner}
                    alt="Banner"
                    className="w-64 h-20 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                      setSettings((prev) => ({ ...prev, banner: "" }));
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                <FaUpload />
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("banner", e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Section>

        {/* Homepage */}
        <Section title="Homepage">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Title
            </label>
            <input
              type="text"
              name="heroTitle"
              value={settings.heroTitle}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Subtitle
            </label>
            <input
              type="text"
              name="heroSubtitle"
              value={settings.heroSubtitle}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
        </Section>

        {/* About */}
        <Section title="About">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About Text
            </label>
            <textarea
              name="aboutText"
              value={settings.aboutText}
              onChange={handleChange}
              rows={4}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Bio
            </label>
            <textarea
              name="ownerBio"
              value={settings.ownerBio}
              onChange={handleChange}
              rows={3}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years in Business
            </label>
            <input
              type="number"
              name="yearsInBusiness"
              value={settings.yearsInBusiness}
              onChange={handleChange}
              className="input-field w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Memberships (one per line)
            </label>
            <textarea
              name="memberships"
              value={settings.memberships}
              onChange={handleChange}
              rows={3}
              className="input-field w-full"
              placeholder={"ANA\nPNG\nPCGS Authorized Dealer"}
            />
          </div>
        </Section>

        {/* Hours */}
        <Section title="Hours">
          <div className="space-y-3">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="flex items-center gap-4 flex-wrap"
              >
                <span className="w-24 text-sm font-medium text-gray-700">
                  {day}
                </span>
                <input
                  type="time"
                  value={settings.hours[i]?.open || "09:00"}
                  onChange={(e) =>
                    handleHoursChange(i, "open", e.target.value)
                  }
                  disabled={settings.hours[i]?.closed}
                  className="input-field w-32 disabled:opacity-50"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="time"
                  value={settings.hours[i]?.close || "17:00"}
                  onChange={(e) =>
                    handleHoursChange(i, "close", e.target.value)
                  }
                  disabled={settings.hours[i]?.closed}
                  className="input-field w-32 disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={settings.hours[i]?.closed || false}
                    onChange={(e) =>
                      handleHoursChange(i, "closed", e.target.checked)
                    }
                    className="w-4 h-4 rounded"
                  />
                  Closed
                </label>
              </div>
            ))}
          </div>
        </Section>

        {/* Social */}
        <Section title="Social">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              name="facebook"
              value={settings.facebook}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              name="instagram"
              value={settings.instagram}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter URL
            </label>
            <input
              type="url"
              name="twitter"
              value={settings.twitter}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="https://twitter.com/yourpage"
            />
          </div>
        </Section>

        {/* Maps */}
        <Section title="Maps">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              name="googleMapsUrl"
              value={settings.googleMapsUrl}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps Embed Code
            </label>
            <textarea
              name="googleMapsEmbed"
              value={settings.googleMapsEmbed}
              onChange={handleChange}
              rows={4}
              className="input-field w-full font-mono text-sm"
              placeholder='<iframe src="..." ...></iframe>'
            />
          </div>
        </Section>

        {/* Email Configuration */}
        <Section title="Email Configuration">
          <p className="text-sm text-gray-500 mb-2">
            Configure SMTP settings so the website can send emails (inquiry replies, appointment confirmations, etc.)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                name="smtpHost"
                value={settings.smtpHost}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="text"
                name="smtpPort"
                value={settings.smtpPort}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="587"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Username
              </label>
              <input
                type="text"
                name="smtpUser"
                value={settings.smtpUser}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Password
              </label>
              <input
                type="password"
                name="smtpPass"
                value={settings.smtpPass}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="App password or SMTP password"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Email Address
            </label>
            <input
              type="email"
              name="smtpFrom"
              value={settings.smtpFrom}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="noreply@yourshop.com"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={testingEmail}
              onClick={async () => {
                setTestingEmail(true);
                setTestEmailResult(null);
                try {
                  const res = await fetch("/api/admin/test-email", { method: "POST" });
                  const data = await res.json();
                  if (data.success) {
                    setTestEmailResult({ success: true, message: `Test email sent to ${data.sentTo}` });
                  } else {
                    setTestEmailResult({ success: false, message: data.error || "Failed to send" });
                  }
                } catch {
                  setTestEmailResult({ success: false, message: "Failed to send test email" });
                } finally {
                  setTestingEmail(false);
                }
              }}
              className="px-4 py-2 border border-[#C9A84C] text-[#C9A84C] rounded-lg text-sm font-medium hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50"
            >
              {testingEmail ? "Sending..." : "Send Test Email"}
            </button>
            {testEmailResult && (
              <span className={`text-sm ${testEmailResult.success ? "text-green-600" : "text-red-600"}`}>
                {testEmailResult.message}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Save settings first, then send a test email. For Gmail, use an App Password (not your regular password).
          </p>
        </Section>

        {/* Google Integration */}
        <Section title="Google Integration">
          <p className="text-sm text-gray-500 mb-2">
            Connect your Google Business profile to import reviews as testimonials.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Place ID
            </label>
            <input
              type="text"
              name="googlePlaceId"
              value={settings.googlePlaceId}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="ChIJ..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Find your Place ID at developers.google.com/maps/documentation/places/web-service/place-id
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google API Key
            </label>
            <input
              type="password"
              name="googleApiKey"
              value={settings.googleApiKey}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="AIza..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Requires Places API enabled. Google returns up to 5 most relevant reviews.
            </p>
          </div>
        </Section>

        {/* Status */}
        <Section title="Status">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({ ...prev, isOpen: !prev.isOpen }))
              }
              className="text-3xl transition-colors"
            >
              {settings.isOpen ? (
                <FaToggleOn className="text-green-500" />
              ) : (
                <FaToggleOff className="text-gray-400" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-700">
              Store is currently{" "}
              <span
                className={
                  settings.isOpen ? "text-green-600" : "text-red-600"
                }
              >
                {settings.isOpen ? "OPEN" : "CLOSED"}
              </span>
            </span>
          </div>
        </Section>

        {/* Save */}
        <div className="pt-4">
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
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
