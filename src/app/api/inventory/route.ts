import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Max 4MB per image file on server side
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const metal = searchParams.get("metal");
    const grade = searchParams.get("grade");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const sort = searchParams.get("sort") || "date-desc";
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause dynamically
    const where: Record<string, unknown> = {
      sold: false, // Exclude sold items from public view
    };

    if (category) where.category = category;
    if (metal) where.metal = metal;
    if (grade) where.grade = grade;
    if (featured === "true") where.featured = true;

    if (minPrice || maxPrice) {
      where.askingPrice = {};
      if (minPrice) (where.askingPrice as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.askingPrice as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) (where.year as Record<string, number>).gte = parseInt(minYear);
      if (maxYear) (where.year as Record<string, number>).lte = parseInt(maxYear);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "price-asc":
        orderBy = { askingPrice: "asc" };
        break;
      case "price-desc":
        orderBy = { askingPrice: "desc" };
        break;
      case "year-asc":
        orderBy = { year: "asc" };
        break;
      case "year-desc":
        orderBy = { year: "desc" };
        break;
      case "date-desc":
        orderBy = { createdAt: "desc" };
        break;
      case "grade":
        orderBy = { grade: "asc" };
        break;
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.coinListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.coinListing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const category = formData.get("category") as string;
    const metal = formData.get("metal") as string | null;
    const year = formData.get("year") ? parseInt(formData.get("year") as string) : null;
    const mintMark = formData.get("mintMark") as string | null;
    const grade = formData.get("grade") as string | null;
    const certification = formData.get("certification") as string | null;
    const certNumber = formData.get("certNumber") as string | null;
    const description = formData.get("description") as string | null;
    const costBasis = formData.get("costBasis") ? parseFloat(formData.get("costBasis") as string) : null;
    const askingPrice = parseFloat(formData.get("askingPrice") as string);
    const quantity = formData.get("quantity") ? parseInt(formData.get("quantity") as string) : 1;
    const featured = formData.get("featured") === "true";

    if (!title || !category || isNaN(askingPrice)) {
      return NextResponse.json(
        { error: "Title, category, and asking price are required" },
        { status: 400 }
      );
    }

    // Handle image uploads - convert to base64 data URLs
    const imageFiles = formData.getAll("images") as File[];
    const imagePaths: string[] = [];

    for (const file of imageFiles) {
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
        imagePaths.push(`data:${mimeType};base64,${base64}`);
      }
    }

    const slug = slugify(title);

    // Check for slug uniqueness and append number if needed
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.coinListing.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const listing = await prisma.coinListing.create({
      data: {
        title,
        slug: finalSlug,
        category,
        metal,
        year,
        mintMark,
        grade,
        certification,
        certNumber,
        description,
        costBasis,
        askingPrice,
        quantity,
        featured,
        images: JSON.stringify(imagePaths),
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
