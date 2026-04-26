"use client";

import { useEffect } from "react";
import { detectMiniApp } from "@/lib/miniapp";

export function MiniAppInit() {
  useEffect(() => {
    if (!detectMiniApp()) return;

    const root = document.documentElement;
    root.dataset.miniapp = "1";

    function syncHeight() {
      root.style.setProperty("--dvh", `${window.innerHeight * 0.01}px`);
    }

    syncHeight();
    window.addEventListener("resize", syncHeight);
    window.visualViewport?.addEventListener("resize", syncHeight);

    return () => {
      window.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("resize", syncHeight);
    };
  }, []);

  return null;
}
