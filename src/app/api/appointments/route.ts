import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { format, parse, addMinutes } from "date-fns";

export const dynamic = "force-dynamic";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface HoursEntry {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

function parseTime(timeStr: string): Date {
  // Parse "9:00 AM" or "5:00 PM" style strings
  return parse(timeStr.trim(), "h:mm a", new Date(2000, 0, 1));
}

function formatSlotTime(date: Date): string {
  return format(date, "h:mm a");
}

function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMin: number
): string[] {
  const slots: string[] = [];
  const start = parseTime(openTime);
  const end = parseTime(closeTime);

  let current = start;
  while (current < end) {
    const slotEnd = addMinutes(current, durationMin);
    if (slotEnd > end) break;
    slots.push(`${formatSlotTime(current)} - ${formatSlotTime(slotEnd)}`);
    current = slotEnd;
  }

  return slots;
}

async function getAppointmentSettings() {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Valid date parameter required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Get store settings for hours
    let storeSettings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    if (!storeSettings) {
      storeSettings = await prisma.storeSettings.create({
        data: { id: "default" },
      });
    }

    const appointmentSettings = await getAppointmentSettings();

    const hours: HoursEntry[] = JSON.parse(storeSettings.hoursJson);
    const blockedDates: string[] = JSON.parse(appointmentSettings.blockedDates);
    const appointmentTypes: string[] = JSON.parse(
      appointmentSettings.appointmentTypes
    );

    // Get day of week
    const dateObj = new Date(dateStr + "T12:00:00");
    const dayOfWeek = DAYS_OF_WEEK[dateObj.getDay()];
    const dayHours = hours.find((h) => h.day === dayOfWeek);

    // Check if closed or blocked
    if (
      !dayHours ||
      dayHours.closed ||
      !dayHours.open ||
      !dayHours.close ||
      blockedDates.includes(dateStr)
    ) {
      return NextResponse.json({
        slots: [],
        appointmentTypes,
        closed: true,
      });
    }

    // Generate time slots
    const timeSlots = generateTimeSlots(
      dayHours.open,
      dayHours.close,
      appointmentSettings.slotDurationMin
    );

    // Count existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: dateStr,
        status: { not: "cancelled" },
      },
      select: { timeSlot: true },
    });

    const slotCounts: Record<string, number> = {};
    existingAppointments.forEach((appt) => {
      slotCounts[appt.timeSlot] = (slotCounts[appt.timeSlot] || 0) + 1;
    });

    const slots = timeSlots.map((time) => ({
      time,
      available: Math.max(
        0,
        appointmentSettings.maxPerSlot - (slotCounts[time] || 0)
      ),
      total: appointmentSettings.maxPerSlot,
    }));

    return NextResponse.json({
      slots,
      appointmentTypes,
      closed: false,
    });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, timeSlot, type, notes } = body;

    // Validate required fields
    if (!name || !email || !phone || !date || !timeSlot || !type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, email, phone, date, timeSlot, type",
        },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check slot availability
    const appointmentSettings = await getAppointmentSettings();

    const existingCount = await prisma.appointment.count({
      where: {
        date,
        timeSlot,
        status: { not: "cancelled" },
      },
    });

    if (existingCount >= appointmentSettings.maxPerSlot) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        name,
        email,
        phone,
        date,
        timeSlot,
        type,
        notes: notes || null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
