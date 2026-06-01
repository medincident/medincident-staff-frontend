"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // iOS Safari ленится перепроверять SW; updateViaCache:"none"
          // заставляет браузер при каждой регистрации перечитывать /sw.js
          // и подхватывать новую версию precache-манифеста.
          updateViaCache: "none",
        });
        if (cancelled) return;

        // Периодически проверяем обновления (раз в час).
        const updateTimer = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Когда controller сменился (после skipWaiting+clientsClaim) —
        // ничего не перезагружаем (reloadOnOnline в next.config делает это
        // при возврате сети). Лишний reload в middle-of-action ломает UX.

        return () => clearInterval(updateTimer);
      } catch (err) {
        // На iOS Safari в обычной вкладке SW может не зарегистрироваться
        // (например, из-за приватного режима) — это не блокирует приложение.
        console.warn("[SW] registration failed:", err);
      }
    };

    register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}