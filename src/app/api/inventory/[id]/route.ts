import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Max 4MB per image file on server side
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.coinListing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.coinListing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    let updateData: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return NextResponse.json(
          { error: "Request too large. Please use smaller images." },
          { status: 413 }
        );
      }

      const title = formData.get("title") as string;
      if (title) updateData.title = title;

      const category = formData.get("category") as string;
      if (category) updateData.category = category;

      const metal = formData.get("metal") as string;
      updateData.metal = metal || null;

      const year = formData.get("year") as string;
      updateData.year = year ? parseInt(year) : null;

      const mintMark = formData.get("mintMark") as string;
      updateData.mintMark = mintMark || null;

      const grade = formData.get("grade") as string;
      updateData.grade = grade || null;

      const certification = formData.get("certification") as string;
      updateData.certification = certification || null;

      const certNumber = formData.get("certNumber") as string;
      updateData.certNumber = certNumber || null;

      const description = formData.get("description") as string;
      updateData.description = description || null;

      const costBasis = formData.get("costBasis") as string;
      updateData.costBasis = costBasis ? parseFloat(costBasis) : null;

      const askingPrice = formData.get("askingPrice") as string;
      if (askingPrice) updateData.askingPrice = parseFloat(askingPrice);

      const quantity = formData.get("quantity") as string;
      if (quantity) updateData.quantity = parseInt(quantity);

      updateData.featured = formData.get("featured") === "true";

      // Handle images
      const existingImages = formData.get("existingImages") as string;
      let currentImages: string[] = [];
      if (existingImages) {
        try { currentImages = JSON.parse(existingImages); } catch { /* ignore */ }
      }

      // Upload new images - convert to base64 data URLs
      const newFiles = formData.getAll("images") as File[];

      for (const file of newFiles) {
        if (file && file.size > 0) {
          if (file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json(
              { error: `Image "${file.name}" is too large. Maximum size is 4MB per image.` },
              { status: 413 }
            );
          }
          const buffer = Buffer.from(await file.arrayBuffer());
          const base64 = buffer.toString('base64');
          const mimeType = file.type || 'image/jpeg';
          currentImages.push(`data:${mimeType};base64,${base64}`);
        }
      }

      updateData.images = JSON.stringify(currentImages);
    } else {
      // JSON body - for simple toggles like featured/sold
      updateData = await request.json();
    }

    const updated = await prisma.coinListing.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.coinListing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    await prisma.coinListing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
