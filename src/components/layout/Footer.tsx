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
    <footer className="border-t-4 border-gold bg-navy text-cream/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Shop Info */}
          <div>
            <h3 className="font-serif text-xl font-bold text-cream mb-4">
              {shopName}
            </h3>
            <address className="not-italic space-y-2 text-sm">
              {address && <p>{address}</p>}
              {cityStateZip.trim() && <p>{cityStateZip}</p>}
              {phone && (
                <p className="pt-2">
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-gold transition-colors"
                  >
                    {phone}
                  </a>
                </p>
              )}
              {emailAddr && (
                <p>
                  <a
                    href={`mailto:${emailAddr}`}
                    className="hover:text-gold transition-colors"
                  >
                    {emailAddr}
                  </a>
                </p>
              )}
            </address>

            {/* Social Media */}
            {hasSocials && (
              <div className="mt-5 flex items-center gap-3">
                {socialFacebook && (
                  <a
                    href={socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream/80 transition-all hover:bg-gold hover:text-navy"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="h-5 w-5" />
                  </a>
                )}
                {socialInstagram && (
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream/80 transition-all hover:bg-gold hover:text-navy"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="h-5 w-5" />
                  </a>
                )}
                {socialTwitter && (
                  <a
                    href={socialTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream/80 transition-all hover:bg-gold hover:text-navy"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-cream mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg font-bold text-cream mb-4">
              Newsletter
            </h3>
            <p className="text-sm mb-4">
              Stay updated with new arrivals, market insights, and exclusive
              offers.
            </p>
            {subscribeStatus === "success" ? (
              <p className="text-sm text-green-400 font-medium">
                Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-cream placeholder-cream/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === "loading"}
                  className="w-full rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark disabled:opacity-50"
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
            <h3 className="font-serif text-lg font-bold text-cream mb-4">
              Memberships
            </h3>
            <p className="text-sm mb-4">
              Proud member of professional numismatic organizations.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 p-2 text-xs font-bold text-cream/60 border border-white/10">
                ANA
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 p-2 text-xs font-bold text-cream/60 border border-white/10">
                PNG
              </div>
            </div>
            <p className="mt-3 text-xs text-cream/50">
              American Numismatic Association &amp; Professional Numismatists Guild
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/50">
            &copy; {currentYear} {shopName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-cream/50">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
