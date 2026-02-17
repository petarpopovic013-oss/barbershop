import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "admin_auth";

function getValidToken(): string {
  const password = process.env.ADMIN_PASSWORD || "1234";
  return createHash("sha256")
    .update(password + "admin-secret-salt")
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const validToken = getValidToken();
    const inputToken = createHash("sha256")
      .update((password || "") + "admin-secret-salt")
      .digest("hex");

    if (inputToken !== validToken) {
      return NextResponse.json(
        { ok: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, validToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
