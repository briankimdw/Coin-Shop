"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory" },
  { label: "We Buy", href: "/we-buy" },
  { label: "Appraisal", href: "/appraisal" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Appointments", href: "/appointments" },
];

interface StoreInfo {
  shopName: string;
  tagline: string;
  logo: string | null;
  hoursJson: string;
  isOpen: boolean;
}

function checkIsOpen(hoursJson: string): boolean {
  try {
    const hours = JSON.parse(hoursJson) as Array<{
      day: string;
      open: string;
      close: string;
      closed: boolean;
    }>;
    const now = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[now.getDay()];
    const todayHours = hours.find((h) => h.day === today);
    if (!todayHours || todayHours.closed) return false;

    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(" ");
      const parts = time.split(":");
      let h = parseInt(parts[0]);
      const m = parseInt(parts[1] || "0");
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= parseTime(todayHours.open) && currentMinutes <= parseTime(todayHours.close);
  } catch {
    return false;
  }
}

export function Header({ store }: { store?: StoreInfo | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const shopName = store?.shopName || "Coin Shop";
  const initials = useMemo(() => {
    const words = shopName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return shopName.slice(0, 2).toUpperCase();
  }, [shopName]);

  const nameParts = useMemo(() => {
    const words = shopName.split(/\s+/);
    if (words.length <= 2) return { line1: shopName, line2: "" };
    const mid = Math.ceil(words.length / 2);
    return { line1: words.slice(0, mid).join(" "), line2: words.slice(mid).join(" ") };
  }, [shopName]);

  useEffect(() => {
    if (store?.hoursJson) {
      setIsOpen(checkIsOpen(store.hoursJson));
      const interval = setInterval(() => setIsOpen(checkIsOpen(store.hoursJson)), 60000);
      return () => clearInterval(interval);
    }
  }, [store?.hoursJson]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-md bg-[#1B2A4A]/97"
          : "bg-[#1B2A4A]"
      )}
    >
      {/* Subtle gold accent line at top */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo / Shop Name */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-all duration-300 hover:opacity-90 group"
          >
            {store?.logo ? (
              <img
                src={store.logo}
                alt={shopName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#C9A84C]/30 sm:h-12 sm:w-12 transition-all duration-300 group-hover:ring-[#C9A84C]/60"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#B8942E] text-[#1B2A4A] font-serif font-bold text-lg sm:h-12 sm:w-12 sm:text-xl shadow-lg shadow-[#C9A84C]/20 transition-all duration-300 group-hover:shadow-[#C9A84C]/40">
                {initials}
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-serif text-lg font-bold text-[#FAF7F0] leading-tight sm:text-xl tracking-wide">
                {nameParts.line1}
              </h1>
              {nameParts.line2 && (
                <p className="text-[11px] text-[#C9A84C] tracking-[0.2em] uppercase font-medium">
                  {nameParts.line2}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-300",
                  pathname === link.href
                    ? "text-[#C9A84C] bg-white/10"
                    : "text-[#FAF7F0]/75 hover:text-[#C9A84C] hover:bg-white/5"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#C9A84C] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side: Status + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Open/Closed Badge */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide border",
                isOpen
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"
                )}
              />
              {isOpen ? "Open Now" : "Closed"}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#FAF7F0]/80 transition-all duration-300 hover:bg-white/10 hover:text-[#C9A84C] lg:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-5 w-5" />
              ) : (
                <FaBars className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden transition-all duration-400 overflow-hidden",
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="border-t border-white/10 bg-[#1B2A4A] px-4 py-3 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? "text-[#C9A84C] bg-white/10"
                  : "text-[#FAF7F0]/75 hover:text-[#C9A84C] hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Open/Closed Badge */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1 sm:hidden">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold",
                isOpen ? "text-green-400" : "text-red-400"
              )}
            >
              {isOpen ? "Open Now" : "Closed"}
            </span>
          </div>
        </nav>
      </div>

      {/* Bottom glow effect */}
      <div className={cn(
        "h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent transition-opacity duration-500",
        scrolled ? "opacity-100" : "opacity-0"
      )} />
    </header>
  );
}
