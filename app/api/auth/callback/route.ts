import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("code_verifier")?.value;
  const callbackUrl = cookieStore.get("auth_callback_url")?.value || "/";

  if (error) {
    console.error("Auth Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 1. Проверяем state (защита от CSRF)
  if (!state || state !== savedState) {
    return NextResponse.json({ error: "Invalid state." }, { status: 400 });
  }

  if (!code || !codeVerifier) {
    return NextResponse.json(
      { error: "Missing code or verifier." },
      { status: 400 },
    );
  }

  try {
    // 2. Обмен кода на токены (Server-to-Server запрос)
    const tokenResponse = await fetch(
      process.env.AUTH_SERVICE_TOKEN_URL || "https://api.auth.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
          client_secret: process.env.CLIENT_SECRET!,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          code,
          code_verifier: codeVerifier,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange token");
    }

    const tokens = await tokenResponse.json();
    const isProd = process.env.NODE_ENV === "production";

    // 3. Удаляем временные куки
    cookieStore.delete("oauth_state");
    cookieStore.delete("code_verifier");
    cookieStore.delete("auth_callback_url");

    // 4. Ставим постоянные HttpOnly куки
    cookieStore.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax", // lax позволяет нормально работать редиректам
      maxAge: tokens.expires_in,
      path: "/",
    });

    if (tokens.refresh_token) {
      cookieStore.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 дней
        path: "/",
      });
    }

    // 5. Возвращаем юзера туда, куда он изначально шел
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  } catch (err) {
    console.error("Token Exchange Error:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
