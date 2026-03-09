import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function base64URLEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // 1. Генерируем state и PKCE
  const state = crypto.randomBytes(32).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = base64URLEncode(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );

  // 2. Сохраняем во временные HttpOnly куки (живут 10 минут)
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
  };

  cookieStore.set("oauth_state", state, cookieOptions);
  cookieStore.set("code_verifier", codeVerifier, cookieOptions);
  cookieStore.set(
    "auth_callback_url",
    decodeURIComponent(callbackUrl),
    cookieOptions,
  ); // Куда вернуть юзера потом

  // 3. Формируем URL для редиректа на твой внешний Auth Gateway
  const authServiceUrl = new URL(
    process.env.AUTH_SERVICE_AUTHORIZE_URL ||
      "https://api.auth.com/oauth/authorize",
  );

  authServiceUrl.searchParams.set("response_type", "code");
  authServiceUrl.searchParams.set(
    "client_id",
    process.env.NEXT_PUBLIC_CLIENT_ID!,
  );
  authServiceUrl.searchParams.set(
    "redirect_uri",
    process.env.NEXT_PUBLIC_REDIRECT_URI!,
  );
  authServiceUrl.searchParams.set("state", state);
  authServiceUrl.searchParams.set("code_challenge", codeChallenge);
  authServiceUrl.searchParams.set("code_challenge_method", "S256");

  // Укажи нужные скоупы, которые требует твой бекенд
  authServiceUrl.searchParams.set(
    "scope",
    "openid profile email offline_access",
  );

  // 4. Перенаправляем на форму логина (или SSO)
  return NextResponse.redirect(authServiceUrl.toString());
}
