"use client";

import { useEffect } from "react";
import { detectMiniApp } from "@/lib/miniapp";

/**
 * Монтируется один раз в корневом layout.
 * В мини-апп окружении:
 *  - ставит data-miniapp на <html> (для CSS-селекторов)
 *  - синхронизирует CSS-переменную --dvh с реальной высотой вьюпорта
 *    (решает сломанный 100vh в WebView Telegram/MAX)
 */
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
    // Клавиатура на мобильных тоже меняет innerHeight
    window.visualViewport?.addEventListener("resize", syncHeight);

    return () => {
      window.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("resize", syncHeight);
    };
  }, []);

  return null;
}
