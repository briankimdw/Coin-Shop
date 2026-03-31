"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FaHome,
  FaUsers,
  FaHandshake,
  FaSearch,
  FaCog,
  FaSignOutAlt,
  FaSpinner,
  FaUserTie,
} from "react-icons/fa";
import { HiMenuAlt2, HiX } from "react-icons/hi";

const navLinks = [
  { href: "/manage", label: "Dashboard", icon: FaHome },
  { href: "/manage/leads", label: "Leads", icon: FaUsers },
  { href: "/manage/clients", label: "Clients", icon: FaHandshake },
  { href: "/manage/scraper", label: "Scraper", icon: FaSearch },
];

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const checkAuth = useCallback(() => {
    fetch("/api/manage/auth")
      .then((r) => r.json())
      .then((data) => {
        setAuthState(data.authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  useEffect(() => {
    // Don't check auth on the login page
    if (pathname === "/manage/login") {
      setAuthState("authenticated"); // Let login page render
      return;
    }
    checkAuth();
  }, [pathname, checkAuth]);

  useEffect(() => {
    if (authState === "unauthenticated" && pathname !== "/manage/login") {
      router.push("/manage/login");
    }
  }, [authState, pathname, router]);

  // Login page renders without the manage chrome
  if (pathname === "/manage/login") {
    return <>{children}</>;
  }

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <FaSpinner className="animate-spin text-4xl text-teal-600" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/manage") return pathname === "/manage";
    return pathname.startsWith(href);
  };

  const breadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    return segments
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" / ");
  };

  const handleSignOut = async () => {
    await fetch("/api/manage/auth", { method: "DELETE" });
    router.push("/manage/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1E293B] text-white transform transition-transform lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUserTie className="text-teal-400 text-xl" />
              <span className="font-bold text-lg">Reseller Portal</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <HiX className="text-xl" />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-teal-600 text-white font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="text-lg" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <FaCog className="text-lg" />
            Shop Admin
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <FaHome className="text-lg" />
            Back to Site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-red-400 transition-colors text-sm w-full"
          >
            <FaSignOutAlt className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <HiMenuAlt2 className="text-2xl" />
          </button>
          <p className="text-sm text-gray-500">{breadcrumb()}</p>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
