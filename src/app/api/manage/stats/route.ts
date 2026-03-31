import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [
      totalLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      convertedLeads,
      notInterestedLeads,
      activeClients,
      pendingClients,
      inactiveClients,
      mrrResult,
      recentLeads,
      recentClients,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.lead.count({ where: { status: "contacted" } }),
      prisma.lead.count({ where: { status: "interested" } }),
      prisma.lead.count({ where: { status: "client" } }),
      prisma.lead.count({ where: { status: "not_interested" } }),
      prisma.client.count({ where: { status: "active" } }),
      prisma.client.count({ where: { status: "pending" } }),
      prisma.client.count({ where: { status: "inactive" } }),
      prisma.client.aggregate({ where: { status: "active" }, _sum: { monthlyRate: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    const mrr = mrrResult._sum.monthlyRate || 0;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

    return NextResponse.json({
      totalLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      convertedLeads,
      notInterestedLeads,
      activeClients,
      pendingClients,
      inactiveClients,
      mrr,
      conversionRate,
      recentLeads,
      recentClients,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
