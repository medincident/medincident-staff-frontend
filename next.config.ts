import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const ZITADEL_ORIGIN = (() => {
  const issuer = process.env.NEXT_PUBLIC_ZITADEL_ISSUER;
  if (!issuer) return "";
  try {
    return new URL(issuer).origin;
  } catch {
    return "";
  }
})();

// Логика precache/runtime-caching и /api/auth NetworkOnly — в app/sw.ts.
const withPWA = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            // CSP на сам SW: Serwist/Workbox используют fetch() даже в
            // NetworkOnly — без Zitadel в connect-src аватарка ломается.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `connect-src 'self' ${ZITADEL_ORIGIN}`.trim(),
              `img-src 'self' data: ${ZITADEL_ORIGIN}`.trim(),
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            ].join("; ") + ";",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
