import { NextRequest, NextResponse } from "next/server";
import { verifyManageAuth, unauthorizedResponse } from "@/lib/manage-auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  
  const authed = await verifyManageAuth(); if (!authed) return unauthorizedResponse();

  try {
    const { leads } = await req.json();
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }

    // Fetch existing leads for dedup (SQLite doesn't support case-insensitive mode)
    const existing = await prisma.lead.findMany({
      select: { name: true, address: true },
    });
    const existingKeys = new Set(
      existing.map((e) => `${e.name.toLowerCase()}|${e.address.toLowerCase()}`)
    );

    const toImport = leads.filter((lead: { name: string; address: string }) => {
      const key = `${(lead.name || "").toLowerCase()}|${(lead.address || "").toLowerCase()}`;
      return !existingKeys.has(key);
    });

    if (toImport.length > 0) {
      await prisma.lead.createMany({
        data: toImport.map((lead: Record<string, unknown>) => ({
          name: (lead.name as string) || "",
          address: (lead.address as string) || "",
          phone: (lead.phone as string) || "",
          website: (lead.website as string) || "",
          webStatus: (lead.webStatus as string) || "unknown",
          rating: lead.rating ? parseFloat(String(lead.rating)) : null,
          reviews: lead.reviews ? parseInt(String(lead.reviews)) : 0,
          mapsUrl: (lead.mapsUrl as string) || "",
          status: "new",
        })),
      });
    }

    return NextResponse.json({
      imported: toImport.length,
      skipped: leads.length - toImport.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to import leads" }, { status: 500 });
  }
}
