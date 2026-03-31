"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "We Buy", href: "/we-buy" },
  { label: "Appraisal", href: "/appraisal" },
  { label: "About", href: "/about" },
];

const moreLinks = [
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Appointments", href: "/appointments" },
  { label: "Testimonials", href: "/testimonials" },
];

interface StoreInfo {
  shopName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
}

export function Footer({ store }: { store?: StoreInfo | null }) {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const shopName = store?.shopName || "Your Coin Shop";
  const address = store?.address || "";
  const cityStateZip = [store?.city, store?.state].filter(Boolean).join(", ") + (store?.zip ? ` ${store.zip}` : "");
  const phone = store?.phone || "";
  const emailAddr = store?.email || "";
  const socialFacebook = store?.socialFacebook || "";
  const socialInstagram = store?.socialInstagram || "";
  const socialTwitter = store?.socialTwitter || "";

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribeStatus("success");
        setEmail("");
      } else {
        setSubscribeStatus("error");
      }
    } catch {
      setSubscribeStatus("error");
    }
  };

  const currentYear = new Date().getFullYear();
  const hasSocials = socialFacebook || socialInstagram || socialTwitter;

  return (
    <footer className="relative bg-[#1B2A4A] text-[#FAF7F0]/70">
      {/* Top gold accent */}
      <div className="h-1 bg-gradient-to-r from-[#B8942E] via-[#C9A84C] to-[#B8942E]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Shop Info */}
          <div>
            <h3 className="font-serif text-xl font-bold text-[#FAF7F0] mb-5 tracking-wide">
              {shopName}
            </h3>
            <address className="not-italic space-y-2.5 text-sm leading-relaxed">
              {address && <p>{address}</p>}
              {cityStateZip.trim() && <p>{cityStateZip}</p>}
              {phone && (
                <p className="pt-2">
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-[#C9A84C] transition-colors duration-300"
                  >
                    {phone}
                  </a>
                </p>
              )}
              {emailAddr && (
                <p>
                  <a
                    href={`mailto:${emailAddr}`}
                    className="hover:text-[#C9A84C] transition-colors duration-300"
                  >
                    {emailAddr}
                  </a>
                </p>
              )}
            </address>

            {/* Social Media */}
            {hasSocials && (
              <div className="mt-6 flex items-center gap-3">
                {socialFacebook && (
                  <a
                    href={socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#FAF7F0]/60 transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1B2A4A] hover:border-[#C9A84C] hover:shadow-lg hover:shadow-[#C9A84C]/20"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="h-4 w-4" />
                  </a>
                )}
                {socialInstagram && (
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#FAF7F0]/60 transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1B2A4A] hover:border-[#C9A84C] hover:shadow-lg hover:shadow-[#C9A84C]/20"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="h-4 w-4" />
                  </a>
                )}
                {socialTwitter && (
                  <a
                    href={socialTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#FAF7F0]/60 transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1B2A4A] hover:border-[#C9A84C] hover:shadow-lg hover:shadow-[#C9A84C]/20"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links - Split into two columns */}
          <div className="grid grid-cols-2 gap-8 sm:col-span-1">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#FAF7F0] mb-5 uppercase tracking-widest">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-[#C9A84C] transition-colors duration-300 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#FAF7F0] mb-5 uppercase tracking-widest">
                Resources
              </h3>
              <ul className="space-y-2.5">
                {moreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-[#C9A84C] transition-colors duration-300 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-sm font-bold text-[#FAF7F0] mb-5 uppercase tracking-widest">
              Newsletter
            </h3>
            <p className="text-sm mb-5 leading-relaxed">
              Stay updated with new arrivals, market insights, and exclusive
              offers.
            </p>
            {subscribeStatus === "success" ? (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-sm text-green-400 font-medium">
                  Thank you for subscribing!
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#FAF7F0] placeholder-[#FAF7F0]/40 outline-none transition-all duration-300 focus:border-[#C9A84C] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)]"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === "loading"}
                  className="w-full rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] px-4 py-3 text-sm font-semibold text-[#1B2A4A] transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A84C]/20 disabled:opacity-50"
                >
                  {subscribeStatus === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
                {subscribeStatus === "error" && (
                  <p className="text-xs text-red-400">Something went wrong. Try again.</p>
                )}
              </form>
            )}
          </div>

          {/* Memberships */}
          <div>
            <h3 className="font-serif text-sm font-bold text-[#FAF7F0] mb-5 uppercase tracking-widest">
              Memberships
            </h3>
            <p className="text-sm mb-5 leading-relaxed">
              Proud member of professional numismatic organizations.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-bold text-[#C9A84C] transition-all duration-300 hover:border-[#C9A84C]/30 hover:bg-white/10">
                ANA
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-bold text-[#C9A84C] transition-all duration-300 hover:border-[#C9A84C]/30 hover:bg-white/10">
                PNG
              </div>
            </div>
            <p className="mt-3 text-xs text-[#FAF7F0]/40 leading-relaxed">
              American Numismatic Association &amp; Professional Numismatists Guild
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#FAF7F0]/40">
            &copy; {currentYear} {shopName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#FAF7F0]/40">
            <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#C9A84C] transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
