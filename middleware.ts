import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authMiddleware = withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});

export default function middleware(req: NextRequest, event: any) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  return authMiddleware(req as any, event);
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|manifest.json|icon-.*).*)",
  ],
};
