import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    startDate.setHours(0, 0, 0, 0);

    // Fetch all sales within the period, including coin listing data
    const sales = await prisma.sale.findMany({
      where: {
        soldAt: {
          gte: startDate,
        },
      },
      include: {
        coinListing: {
          select: {
            id: true,
            title: true,
            category: true,
            images: true,
          },
        },
      },
      orderBy: {
        soldAt: "desc",
      },
    });

    // Aggregate sales by day
    const salesByDayMap = new Map<string, { count: number; revenue: number }>();

    // Initialize all days in the period with zeros for a continuous series
    for (let i = 0; i < period; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (period - 1 - i));
      const dateStr = date.toISOString().split("T")[0];
      salesByDayMap.set(dateStr, { count: 0, revenue: 0 });
    }

    // Fill in actual sale data
    let totalRevenue = 0;
    for (const sale of sales) {
      const dateStr = sale.soldAt.toISOString().split("T")[0];
      const existing = salesByDayMap.get(dateStr) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += sale.salePrice;
      salesByDayMap.set(dateStr, existing);
      totalRevenue += sale.salePrice;
    }

    const salesByDay = Array.from(salesByDayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
      }));

    const totalSales = sales.length;
    const averageSalePrice =
      totalSales > 0 ? Math.round((totalRevenue / totalSales) * 100) / 100 : 0;

    // Group by category for top categories
    const categoryMap = new Map<string, number>();
    for (const sale of sales) {
      const cat = sale.coinListing.category;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + sale.salePrice);
    }

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, revenue]) => ({
        category,
        revenue: Math.round(revenue * 100) / 100,
      }));

    // Recent sales (last 10)
    const recentSales = sales.slice(0, 10).map((sale) => ({
      id: sale.id,
      coinListingId: sale.coinListingId,
      salePrice: sale.salePrice,
      soldAt: sale.soldAt.toISOString(),
      coinListing: {
        title: sale.coinListing.title,
        category: sale.coinListing.category,
        images: sale.coinListing.images,
      },
    }));

    return NextResponse.json({
      salesByDay,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalSales,
      averageSalePrice,
      topCategories,
      recentSales,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
