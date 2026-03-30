import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const [
      totalListings,
      activeListings,
      soldCount,
      inventoryValue,
      newContactInquiries,
      newAppraisalInquiries,
      newsletterSubscribers,
      todayAppointments,
      pendingAppointments,
      todayAppointmentsList,
      lowStockItems,
    ] = await Promise.all([
      prisma.coinListing.count(),
      prisma.coinListing.count({ where: { sold: false } }),
      prisma.coinListing.count({ where: { sold: true } }),
      prisma.coinListing.aggregate({
        where: { sold: false },
        _sum: { askingPrice: true },
      }),
      prisma.contactSubmission.count({ where: { status: "new" } }),
      prisma.appraisalRequest.count({ where: { status: "new" } }),
      prisma.newsletter.count(),
      prisma.appointment.count({ where: { date: today } }),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.appointment.findMany({
        where: { date: today },
        select: { id: true, name: true, timeSlot: true, type: true, phone: true, status: true },
        orderBy: { timeSlot: "asc" },
      }),
      prisma.coinListing.findMany({
        where: { sold: false, quantity: { lte: 2 } },
        select: { id: true, title: true, quantity: true },
        take: 10,
        orderBy: { quantity: "asc" },
      }),
    ]);

    return NextResponse.json({
      totalListings,
      activeListings,
      soldCount,
      totalInventoryValue: inventoryValue._sum.askingPrice || 0,
      newInquiries: newContactInquiries + newAppraisalInquiries,
      newsletterSubscribers,
      todayAppointments,
      pendingAppointments,
      todayAppointmentsList,
      lowStockItems,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
