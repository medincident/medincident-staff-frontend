import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const { pathname, search } = request.nextUrl;

  // Пропускаем системные API-роуты авторизации, чтобы они могли работать
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Если нет токенов — отправляем на наш генератор PKCE
  if (!accessToken && !refreshToken) {
    const url = new URL("/api/auth/login", request.url);
    // Сохраняем путь, куда шел пользователь (включая query параметры)
    url.searchParams.set("callbackUrl", encodeURIComponent(pathname + search));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|manifest.json|icon-.*).*)",
  ],
};
