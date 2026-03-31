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

    if (body.monthlyRate) body.monthlyRate = parseFloat(body.monthlyRate);
    if (body.setupFee) body.setupFee = parseFloat(body.setupFee);
    if (body.startDate) body.startDate = new Date(body.startDate);

    const client = await prisma.client.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  const authed = await verifyManageAuth(); if (!authed) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
