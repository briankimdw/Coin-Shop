import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Max 4MB per image file on server side
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

// Helper to find post by slug OR id
async function findPost(slugOrId: string) {
  let post = await prisma.blogPost.findUnique({ where: { slug: slugOrId } });
  if (!post) {
    post = await prisma.blogPost.findUnique({ where: { id: slugOrId } });
  }
  return post;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await findPost(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await findPost(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    let updateData: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return NextResponse.json(
          { error: "Request too large. Please use a smaller image." },
          { status: 413 }
        );
      }
      updateData.title = formData.get("title") as string;
      updateData.content = formData.get("content") as string;
      updateData.excerpt = (formData.get("excerpt") as string) || null;
      updateData.published = formData.get("published") === "true";

      const tagsStr = formData.get("tags") as string;
      if (tagsStr) {
        updateData.tags = JSON.stringify(
          tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
        );
      }

      if (formData.get("removeCover") === "true") {
        updateData.coverImage = null;
      }

      const coverFile = formData.get("coverImage") as File | null;
      if (coverFile && coverFile.size > 0) {
        if (coverFile.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: "Cover image is too large. Maximum size is 4MB." },
            { status: 413 }
          );
        }
        const buffer = Buffer.from(await coverFile.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = coverFile.type || 'image/jpeg';
        updateData.coverImage = `data:${mimeType};base64,${base64}`;
      }
    } else {
      const body = await request.json();
      updateData = { ...body };
      if (Array.isArray(updateData.tags)) {
        updateData.tags = JSON.stringify(updateData.tags);
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await findPost(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id: post.id } });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
