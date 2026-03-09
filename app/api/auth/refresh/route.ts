import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const response = await fetch(
      process.env.AUTH_SERVICE_TOKEN_URL || "https://api.auth.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
          client_secret: process.env.CLIENT_SECRET!,
          refresh_token: refreshToken,
        }),
      },
    );

    if (!response.ok) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const tokens = await response.json();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    });

    if (tokens.refresh_token) {
      cookieStore.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
