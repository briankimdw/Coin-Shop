import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSettings() {
  let settings = await prisma.appointmentSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.appointmentSettings.create({
      data: { id: "default" },
    });
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getSettings();

    return NextResponse.json({
      ...settings,
      appointmentTypes: JSON.parse(settings.appointmentTypes),
      blockedDates: JSON.parse(settings.blockedDates),
    });
  } catch (error) {
    console.error("Error fetching appointment settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.slotDurationMin !== undefined)
      updateData.slotDurationMin = body.slotDurationMin;
    if (body.maxPerSlot !== undefined)
      updateData.maxPerSlot = body.maxPerSlot;
    if (body.advanceBookDays !== undefined)
      updateData.advanceBookDays = body.advanceBookDays;
    if (body.appointmentTypes !== undefined)
      updateData.appointmentTypes = JSON.stringify(body.appointmentTypes);
    if (body.blockedDates !== undefined)
      updateData.blockedDates = JSON.stringify(body.blockedDates);

    // Upsert to handle case where settings don't exist yet
    const settings = await prisma.appointmentSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: { id: "default", ...updateData },
    });

    return NextResponse.json({
      ...settings,
      appointmentTypes: JSON.parse(settings.appointmentTypes),
      blockedDates: JSON.parse(settings.blockedDates),
    });
  } catch (error) {
    console.error("Error updating appointment settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
