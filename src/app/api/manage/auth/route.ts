import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const PIN = process.env.MANAGE_PIN || "123456";
const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";
const COOKIE_NAME = "manage_auth";

function signToken(): string {
  const payload = `manage_portal_${Date.now()}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  return sig === expected;
}

// GET: Check if authenticated
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) {
    return NextResponse.json({ authenticated: false });
  }
  const valid = verifyToken(cookie.value);
  return NextResponse.json({ authenticated: valid });
}

// POST: Authenticate with PIN
export async function POST(req: NextRequest) {
  if (!PIN) {
    return NextResponse.json(
      { error: "MANAGE_PIN not configured. Set it in your environment variables." },
      { status: 500 }
    );
  }

  const { pin } = await req.json();
  if (pin !== PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const token = signToken();
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

// DELETE: Sign out
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
