"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaCoins,
  FaBlog,
  FaEnvelope,
  FaCog,
  FaChartLine,
  FaSignOutAlt,
  FaSpinner,
  FaStar,
  FaQuestionCircle,
  FaCalendarAlt,
  FaSearchDollar,
} from "react-icons/fa";
import { HiMenuAlt2, HiX } from "react-icons/hi";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: FaHome },
  { href: "/admin/inventory", label: "Inventory", icon: FaCoins },
  { href: "/admin/want-to-buy", label: "Want to Buy", icon: FaSearchDollar },
  { href: "/admin/appointments", label: "Appointments", icon: FaCalendarAlt },
  { href: "/admin/inquiries", label: "Inquiries", icon: FaEnvelope },
  { href: "/admin/blog", label: "Blog", icon: FaBlog },
  { href: "/admin/testimonials", label: "Testimonials", icon: FaStar },
  { href: "/admin/faq", label: "FAQ", icon: FaQuestionCircle },
  { href: "/admin/spot-prices", label: "Spot Prices", icon: FaChartLine },
  { href: "/admin/settings", label: "Settings", icon: FaCog },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shopName, setShopName] = useState("Coin Shop");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d.shopName) setShopName(d.shopName); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, pathname, router]);

  // Don't wrap login page with admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-[#C9A84C]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const breadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    return segments
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" / ");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1B2A4A] text-white transform transition-transform duration-200 ease-in-out lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col shadow-xl lg:shadow-none`}
      >
        {/* Shop name */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center">
                <FaCoins className="text-[#C9A84C] text-sm" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-wide">{shopName}</span>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Admin</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <HiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-[13px] ${
                  active
                    ? "bg-[#C9A84C]/15 text-[#C9A84C] font-semibold border-l-[3px] border-[#C9A84C] ml-0 pl-[9px]"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                }`}
              >
                <Icon className={`text-base ${active ? "text-[#C9A84C]" : ""}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-white/50 hover:text-white/80 transition-colors text-[13px] rounded-lg hover:bg-white/[0.06]"
          >
            <FaHome className="text-sm" />
            Back to Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3 py-2 text-white/50 hover:text-red-400 transition-colors text-[13px] w-full rounded-lg hover:bg-white/[0.06]"
          >
            <FaSignOutAlt className="text-sm" />
            Sign Out
          </button>
          {session?.user?.email && (
            <p className="px-3 pt-1 text-[11px] text-white/30 truncate">
              {session.user.email}
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200/80 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors"
          >
            <HiMenuAlt2 className="text-xl" />
          </button>
          <p className="text-xs font-medium text-gray-400 tracking-wide">
            {breadcrumb()}
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50/80">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
