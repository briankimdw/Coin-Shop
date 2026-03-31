import { NextRequest, NextResponse } from "next/server";
import { verifyManageAuth, unauthorizedResponse } from "@/lib/manage-auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  const authed = await verifyManageAuth(); if (!authed) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();

    // Auto-set contactedAt when status changes to contacted
    if (body.status === "contacted" && !body.contactedAt) {
      const existing = await prisma.lead.findUnique({ where: { id } });
      if (existing && !existing.contactedAt) {
        body.contactedAt = new Date();
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  const authed = await verifyManageAuth(); if (!authed) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
