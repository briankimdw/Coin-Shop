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

  // Split name for two-line display: first word + rest
  const nameParts = useMemo(() => {
    const words = shopName.split(/\s+/);
    if (words.length <= 2) return { line1: shopName, line2: "" };
    // Try to split at a natural point
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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "shadow-lg backdrop-blur-md bg-navy/95"
          : "bg-navy"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo / Shop Name */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            {store?.logo ? (
              <img
                src={store.logo}
                alt={shopName}
                className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy font-serif font-bold text-lg sm:h-12 sm:w-12 sm:text-xl">
                {initials}
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-serif text-lg font-bold text-cream leading-tight sm:text-xl">
                {nameParts.line1}
              </h1>
              {nameParts.line2 && (
                <p className="text-xs text-gold tracking-wider uppercase">
                  {nameParts.line2}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname === link.href
                    ? "text-gold bg-white/10"
                    : "text-cream/80 hover:text-gold hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Status + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Open/Closed Badge */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                isOpen
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"
                )}
              />
              {isOpen ? "Open Now" : "Closed"}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-cream/80 transition-colors hover:bg-white/10 hover:text-gold lg:hidden"
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
          "lg:hidden transition-all duration-300 overflow-hidden",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="border-t border-white/10 bg-navy px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-md px-4 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-gold bg-white/10"
                  : "text-cream/80 hover:text-gold hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Open/Closed Badge */}
          <div className="flex items-center gap-2 px-4 pt-3 sm:hidden">
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
    </header>
  );
}
