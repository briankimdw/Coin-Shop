import { NextRequest, NextResponse } from "next/server";
import { verifyManageAuth, unauthorizedResponse } from "@/lib/manage-auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authed = await verifyManageAuth();
  if (!authed) return unauthorizedResponse();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not configured. Add it to your environment variables." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeKey);

  try {
    const { clientId, type } = await req.json();

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json({ error: "Client needs an email address for billing" }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = client.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name: client.shopName,
        metadata: { clientId: client.id },
      });
      customerId = customer.id;
      await prisma.client.update({
        where: { id: client.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "http://localhost:3000";

    if (type === "setup") {
      // One-time setup fee
      const amount = client.setupFee || 0;
      if (amount <= 0) {
        return NextResponse.json({ error: "Setup fee not configured for this client" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Website Setup - ${client.shopName}`,
              description: "One-time website setup and configuration fee",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        metadata: { clientId: client.id, type: "setup" },
        success_url: `${baseUrl}/manage/clients?payment=success`,
        cancel_url: `${baseUrl}/manage/clients?payment=cancelled`,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    if (type === "subscription") {
      // Recurring monthly subscription
      const amount = client.monthlyRate || 0;
      if (amount <= 0) {
        return NextResponse.json({ error: "Monthly rate not configured for this client" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Website Hosting - ${client.shopName}`,
              description: "Monthly website hosting and maintenance",
            },
            unit_amount: Math.round(amount * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        metadata: { clientId: client.id, type: "subscription" },
        success_url: `${baseUrl}/manage/clients?payment=success`,
        cancel_url: `${baseUrl}/manage/clients?payment=cancelled`,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    return NextResponse.json({ error: "Invalid type. Use 'setup' or 'subscription'." }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Billing error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
