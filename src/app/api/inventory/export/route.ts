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

    const listings = await prisma.coinListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "ID",
      "Title",
      "Slug",
      "Category",
      "Metal",
      "Year",
      "Mint Mark",
      "Grade",
      "Certification",
      "Cert Number",
      "Description",
      "Cost Basis",
      "Asking Price",
      "Quantity",
      "Featured",
      "Sold",
      "Images",
      "Created At",
      "Updated At",
    ];

    const escapeCSV = (value: unknown): string => {
      const str = value === null || value === undefined ? "" : String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = listings.map((listing) =>
      [
        listing.id,
        listing.title,
        listing.slug,
        listing.category,
        listing.metal,
        listing.year,
        listing.mintMark,
        listing.grade,
        listing.certification,
        listing.certNumber,
        listing.description,
        listing.costBasis,
        listing.askingPrice,
        listing.quantity,
        listing.featured,
        listing.sold,
        listing.images,
        listing.createdAt.toISOString(),
        listing.updatedAt.toISOString(),
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting inventory:", error);
    return NextResponse.json(
      { error: "Failed to export inventory" },
      { status: 500 }
    );
  }
}
