import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.shopName) {
      return NextResponse.json({ error: "Shop name is required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        shopName: body.shopName,
        ownerName: body.ownerName || "",
        email: body.email || "",
        phone: body.phone || "",
        domain: body.domain || "",
        plan: body.plan || "basic",
        status: body.status || "pending",
        monthlyRate: body.monthlyRate ? parseFloat(body.monthlyRate) : 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        notes: body.notes || "",
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
