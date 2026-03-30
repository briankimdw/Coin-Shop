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
    const type = searchParams.get("type") || "all";

    let contacts: unknown[] = [];
    let appraisals: unknown[] = [];

    if (type === "all" || type === "contact") {
      contacts = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (type === "all" || type === "appraisal") {
      appraisals = await prisma.appraisalRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    // Combine and sort by newest first
    type InquiryItem = Record<string, unknown> & { type: string; createdAt: unknown };
    const tagged: InquiryItem[] = [
      ...contacts.map((c) => ({ ...(c as Record<string, unknown>), type: "contact" }) as InquiryItem),
      ...appraisals.map((a) => ({ ...(a as Record<string, unknown>), type: "appraisal" }) as InquiryItem),
    ];
    const allInquiries = tagged.sort((a, b) => {
      const dateA = new Date(a.createdAt as string).getTime();
      const dateB = new Date(b.createdAt as string).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ inquiries: allInquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
