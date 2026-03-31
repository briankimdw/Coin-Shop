import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const description = formData.get("description") as string;
    const contactMethod = (formData.get("contactMethod") as string) || "email";

    // Validate required fields
    if (!name || !email || !description) {
      return NextResponse.json(
        { error: "Name, email, and description are required" },
        { status: 400 }
      );
    }

    // Handle image uploads (up to 5) - convert to base64 data URLs
    const imageFiles = formData.getAll("images") as File[];
    const imagePaths: string[] = [];

    const maxImages = Math.min(imageFiles.length, 5);
    for (let i = 0; i < maxImages; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        imagePaths.push(`data:${mimeType};base64,${base64}`);
      }
    }

    const appraisalRequest = await prisma.appraisalRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        description,
        contactMethod,
        images: JSON.stringify(imagePaths),
      },
    });

    return NextResponse.json(
      { message: "Appraisal request submitted successfully", id: appraisalRequest.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting appraisal request:", error);
    return NextResponse.json(
      { error: "Failed to submit appraisal request" },
      { status: 500 }
    );
  }
}
