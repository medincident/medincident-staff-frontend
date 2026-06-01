import { APP_CONFIG, THEME_COLORS } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    // iOS открывает PWA по start_url из standalone-режима; /dashboard
    // редиректит на Zitadel при отсутствии cookie → оффлайн-юзер видит
    // ошибку. С корнем "/" Next отдаёт страницу-маршрутизатор, и SW
    // подставит /offline, если сети нет.
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: THEME_COLORS.dark,
    theme_color: THEME_COLORS.dark,
    categories: ["medical", "health"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/icons/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
