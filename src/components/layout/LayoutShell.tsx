"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

interface StoreInfo {
  shopName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  logo: string | null;
  isOpen: boolean;
  hoursJson: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [store, setStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setStore)
      .catch(() => {});
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header store={store} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer store={store} />
      <MobileNav />
    </div>
  );
}
