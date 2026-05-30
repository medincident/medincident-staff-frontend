import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default function middleware(req: NextRequest, event: any) {
  return authMiddleware(req as any, event);
}

export const config = {
  matcher: [
    "/((?!api/auth|login|logout|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|manifest\\.(?:json|webmanifest)|icons/).*)",
  ],
};
