import { withAuth } from "next-auth/middleware";

// 1. Инициализируем middleware от NextAuth с твоими настройками
const authMiddleware = withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});

// 2. Экспортируем основную функцию middleware
export default function middleware(req: any, event: any) {
  // Логируем метод и путь запроса
  console.log(`[${req.method}] ${req.nextUrl.pathname}`);

  // Вызываем NextAuth middleware
  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    // Защищаем ВСЁ приложение, кроме указанных исключений
    "/((?!api/auth|api/zitadel|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|manifest.json|icon-.*).*)",
  ],
};
