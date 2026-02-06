import { APP_CONFIG } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#1f1f23",
    theme_color: "#1f1f23",
    categories: ["medicine"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
