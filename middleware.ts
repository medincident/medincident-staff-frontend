import { withAuth } from "next-auth/middleware";

// withAuth автоматически защищает все роуты, подходящие под matcher
export default withAuth({
  pages: {
    // Если хочешь, чтобы при отсутствии сессии сразу кидало на Zitadel:
    signIn: '/api/auth/signin',
  },
});

export const config = {
  matcher: [
    // Защищаем всё, кроме апи, статики и манифестов PWA
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|manifest.json|icon-.*).*)',
  ],
};