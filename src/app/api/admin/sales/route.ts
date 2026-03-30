import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { coinListingId, salePrice, soldAt, notes } = body as {
      coinListingId: string;
      salePrice: number;
      soldAt?: string;
      notes?: string;
    };

    if (!coinListingId || salePrice == null || isNaN(salePrice)) {
      return NextResponse.json(
        { error: "coinListingId and salePrice are required" },
        { status: 400 }
      );
    }

    // Validate the listing exists and is not already sold
    const listing = await prisma.coinListing.findUnique({
      where: { id: coinListingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.sold) {
      return NextResponse.json(
        { error: "This listing is already marked as sold" },
        { status: 400 }
      );
    }

    // Use a transaction to create the Sale and mark the listing as sold
    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
        data: {
          coinListingId,
          salePrice,
          soldAt: soldAt ? new Date(soldAt) : new Date(),
          notes: notes || null,
        },
        include: {
          coinListing: true,
        },
      });

      await tx.coinListing.update({
        where: { id: coinListingId },
        data: { sold: true },
      });

      return createdSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error recording sale:", error);
    return NextResponse.json(
      { error: "Failed to record sale" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        include: { coinListing: true },
        orderBy: { soldAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sale.count(),
    ]);

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}
