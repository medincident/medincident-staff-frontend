"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { THEME_COLORS } from "@/lib/constants";

export function ThemeColorManager() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let metaThemeColor = document.querySelector("meta[name='theme-color']");

    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    const color = resolvedTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;
    
    metaThemeColor.removeAttribute("media");
    metaThemeColor.setAttribute("content", color);
    
  }, [resolvedTheme]);

  return null;
}