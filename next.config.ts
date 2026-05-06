import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const ZITADEL_ORIGIN = (() => {
  const issuer = process.env.NEXT_PUBLIC_ZITADEL_ISSUER;
  if (!issuer) return "";
  try {
    return new URL(issuer).origin;
  } catch {
    return "";
  }
})();

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  // SW не кэширует /api/auth/*: повторный fetch одного и того же
  // auth-кода в Zitadel ловит Errors.AuthRequest.NoCode.
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /\/api\/auth\//,
        handler: "NetworkOnly",
      },
    ],
  },
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
            // CSP применяется к самому SW. Workbox использует fetch()
            // даже в NetworkOnly — без Zitadel в connect-src аватарка
            // ломается.
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
