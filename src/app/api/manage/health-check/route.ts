import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkSite(url: string): Promise<{ status: string; responseTime: number }> {
  if (!url) return { status: "no_url", responseTime: 0 };

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    const responseTime = Date.now() - start;
    if (res.ok) return { status: "up", responseTime };
    if (res.status >= 500) return { status: "error", responseTime };
    return { status: "warning", responseTime };
  } catch {
    return { status: "down", responseTime: Date.now() - start };
  }
}

// POST: Check one or all client sites
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { clientId } = await req.json();

    // Check a single client
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

      const result = await checkSite(client.siteUrl);
      await prisma.client.update({
        where: { id: clientId },
        data: {
          lastCheckAt: new Date(),
          lastCheckStatus: result.status,
        },
      });

      return NextResponse.json({ id: clientId, ...result });
    }

    // Check all clients with a siteUrl
    const clients = await prisma.client.findMany({
      where: { siteUrl: { not: "" }, status: "active" },
    });

    const results = await Promise.all(
      clients.map(async (client) => {
        const result = await checkSite(client.siteUrl);
        await prisma.client.update({
          where: { id: client.id },
          data: {
            lastCheckAt: new Date(),
            lastCheckStatus: result.status,
          },
        });
        return { id: client.id, shopName: client.shopName, ...result };
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
