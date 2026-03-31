import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Max 4MB per image file on server side
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export async function GET() {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      const settingsJson = formData.get("settings") as string;

      if (settingsJson) {
        const parsed = JSON.parse(settingsJson);

        // Map form fields to database fields
        updateData = {
          shopName: parsed.shopName,
          tagline: parsed.tagline,
          address: parsed.address,
          city: parsed.city,
          state: parsed.state,
          zip: parsed.zip,
          phone: parsed.phone,
          email: parsed.email,
          heroTitle: parsed.heroTitle,
          heroSubtitle: parsed.heroSubtitle,
          aboutText: parsed.aboutText,
          ownerBio: parsed.ownerBio,
          yearsInBusiness: parsed.yearsInBusiness,
          socialFacebook: parsed.facebook || "",
          socialInstagram: parsed.instagram || "",
          socialTwitter: parsed.twitter || "",
          googleMapsUrl: parsed.googleMapsUrl || "",
          googleMapsEmbed: parsed.googleMapsEmbed || "",
          googlePlaceId: parsed.googlePlaceId || "",
          googleApiKey: parsed.googleApiKey || "",
          smtpHost: parsed.smtpHost || "",
          smtpPort: parsed.smtpPort || "",
          smtpUser: parsed.smtpUser || "",
          smtpPass: parsed.smtpPass || "",
          smtpFrom: parsed.smtpFrom || "",
          isOpen: parsed.isOpen,
        };

        // Handle memberships
        if (parsed.memberships) {
          updateData.memberships = JSON.stringify(
            parsed.memberships.split("\n").map((m: string) => m.trim()).filter(Boolean)
          );
        }

        // Handle hours
        if (parsed.hours && Array.isArray(parsed.hours)) {
          const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const hoursArray = days.map((day, i) => ({
            day,
            open: parsed.hours[i]?.open || "9:00 AM",
            close: parsed.hours[i]?.close || "5:00 PM",
            closed: parsed.hours[i]?.closed || false,
          }));
          updateData.hoursJson = JSON.stringify(hoursArray);
        }
      }

      // Handle file uploads - convert to base64 data URLs
      const logoFile = formData.get("logo") as File | null;
      if (logoFile && logoFile.size > 0) {
        if (logoFile.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: "Logo image is too large. Maximum size is 4MB." },
            { status: 413 }
          );
        }
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = logoFile.type || 'image/jpeg';
        updateData.logo = `data:${mimeType};base64,${base64}`;
      }

      const bannerFile = formData.get("banner") as File | null;
      if (bannerFile && bannerFile.size > 0) {
        if (bannerFile.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: "Banner image is too large. Maximum size is 4MB." },
            { status: 413 }
          );
        }
        const buffer = Buffer.from(await bannerFile.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = bannerFile.type || 'image/jpeg';
        updateData.bannerImage = `data:${mimeType};base64,${base64}`;
      }
    } else {
      updateData = await request.json();
    }

    // Remove any undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: { id: "default", ...updateData },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
