import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["contact", "appraisal"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'contact' or 'appraisal'" },
        { status: 400 }
      );
    }

    let inquiry;
    if (type === "contact") {
      inquiry = await prisma.contactSubmission.findUnique({
        where: { id: params.id },
      });
    } else {
      inquiry = await prisma.appraisalRequest.findUnique({
        where: { id: params.id },
      });
    }

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    const replies = await prisma.inquiryReply.findMany({
      where: {
        inquiryId: params.id,
        inquiryType: type,
      },
      orderBy: { sentAt: "asc" },
    });

    return NextResponse.json({ inquiry, replies });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
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

    const body = await request.json();
    const { status, adminNotes, type } = body;

    if (!type || !["contact", "appraisal"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'contact' or 'appraisal'" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    let updated;

    if (type === "contact") {
      updated = await prisma.contactSubmission.update({
        where: { id: params.id },
        data: updateData,
      });
    } else {
      updated = await prisma.appraisalRequest.update({
        where: { id: params.id },
        data: updateData,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
