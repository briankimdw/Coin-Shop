import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    const toEmail = settings?.email || session.user?.email || "";
    if (!toEmail) {
      return NextResponse.json(
        { error: "No recipient email configured" },
        { status: 400 }
      );
    }

    const shopName = settings?.shopName || "Your Coin Shop";

    const result = await sendEmail(
      toEmail,
      `Test Email from ${shopName}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B2A4A; padding: 20px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 24px;">${shopName}</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333;">Email Configuration Test</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a test email to confirm your SMTP settings are configured correctly.
              If you're reading this, your email system is working!
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Sent from your ${shopName} admin panel.
            </p>
          </div>
        </div>
      `
    );

    if (result.success) {
      return NextResponse.json({ success: true, sentTo: toEmail });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send test email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
