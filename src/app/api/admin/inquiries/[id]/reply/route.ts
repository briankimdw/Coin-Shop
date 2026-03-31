import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, message, toEmail, toName } = body;

    if (!type || !["contact", "appraisal"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'contact' or 'appraisal'" },
        { status: 400 }
      );
    }

    if (!message || !toEmail) {
      return NextResponse.json(
        { error: "Message and toEmail are required" },
        { status: 400 }
      );
    }

    // Load shop name from settings for the email template
    let shopName = "Vintage Coin Shop";
    try {
      const settings = await prisma.storeSettings.findUnique({
        where: { id: "default" },
        select: { shopName: true },
      });
      if (settings?.shopName) {
        shopName = settings.shopName;
      }
    } catch {
      // Use default shop name
    }

    // Build branded HTML email
    const htmlContent = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1B2A4A; padding: 24px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 22px; letter-spacing: 0.5px;">${shopName}</h1>
        </div>
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Dear ${toName || "Valued Customer"},</p>
          <div style="color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap; margin: 16px 0;">${message}</div>
        </div>
        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">This email was sent in response to your inquiry. Please do not reply directly to this email.</p>
        </div>
      </div>
    `;

    // Attempt to send email -- fail early if it doesn't work
    const emailResult = await sendEmail(
      toEmail,
      `Re: Your Inquiry - ${shopName}`,
      htmlContent
    );

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: emailResult.error || "Failed to send email",
          emailError: true,
        },
        { status: 500 }
      );
    }

    // Only record the reply and update status after email sends successfully
    const reply = await prisma.inquiryReply.create({
      data: {
        inquiryId: params.id,
        inquiryType: type,
        message,
        sentTo: toEmail,
      },
    });

    // Update inquiry status to "responded"
    if (type === "contact") {
      await prisma.contactSubmission.update({
        where: { id: params.id },
        data: { status: "responded" },
      });
    } else {
      await prisma.appraisalRequest.update({
        where: { id: params.id },
        data: { status: "responded" },
      });
    }

    return NextResponse.json({
      success: true,
      reply,
      emailSent: true,
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
