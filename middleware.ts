// export default withAuth({
//   pages: {
//     signIn: "/api/auth/signin",
//   },
// });

export const config = {
  matcher: [
    // Защищаем ВСЁ приложение, кроме:
    // - /api/auth/*
    // - статических файлов, картинок, манифестов PWA
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|manifest.json|icon-.*).*)",
  ],
};
