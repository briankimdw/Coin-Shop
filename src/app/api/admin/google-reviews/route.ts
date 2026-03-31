import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    const placeId = settings?.googlePlaceId;
    const apiKey = settings?.googleApiKey;

    if (!placeId || !apiKey) {
      return NextResponse.json(
        {
          error:
            "Google Place ID and API Key must be configured in Settings > Google Integration",
        },
        { status: 400 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Google API error: ${data.status} - ${data.error_message || "Unknown error"}` },
        { status: 400 }
      );
    }

    const reviews = (data.result?.reviews || []).map(
      (r: {
        author_name: string;
        rating: number;
        text: string;
        time: number;
        relative_time_description: string;
      }) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relativeTime: r.relative_time_description,
      })
    );

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google reviews" },
      { status: 500 }
    );
  }
}
