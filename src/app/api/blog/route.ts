import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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
    const showAll = searchParams.get("all") === "true";
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};

    // Only show published posts unless ?all=true (admin)
    if (!showAll) {
      where.published = true;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
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

    const contentType = request.headers.get("content-type") || "";
    let title: string,
      content: string,
      excerpt: string | null = null,
      coverImagePath: string | null = null,
      published = false,
      tags = "[]";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      content = formData.get("content") as string;
      excerpt = (formData.get("excerpt") as string) || null;
      published = formData.get("published") === "true";

      const tagsStr = formData.get("tags") as string;
      if (tagsStr) {
        tags = JSON.stringify(
          tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
        );
      }

      const coverFile = formData.get("coverImage") as File | null;
      if (coverFile && coverFile.size > 0) {
        const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const buffer = Buffer.from(await coverFile.arrayBuffer());
        const filename = `${Date.now()}-${coverFile.name}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        coverImagePath = `/images/uploads/${filename}`;
      }
    } else {
      const body = await request.json();
      title = body.title;
      content = body.content;
      excerpt = body.excerpt || null;
      published = body.published || false;
      coverImagePath = body.coverImage || null;
      tags = body.tags ? JSON.stringify(body.tags) : "[]";
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    let finalSlug = slugify(title);
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slugify(title)}-${counter}`;
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt,
        coverImage: coverImagePath,
        published,
        tags,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
