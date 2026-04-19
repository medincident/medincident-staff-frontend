import { useEffect, useState } from "react";

/**
 * Определяет, запущено ли приложение внутри мини-апп окружения
 * (Telegram WebApp или MAX/VKApp).
 */
export function detectMiniApp(): boolean {
  if (typeof window === "undefined") return false;

  // Telegram Web App SDK
  if ((window as any).Telegram?.WebApp?.initData) return true;

  // MAX (Mail.ru / VK mini-apps) и ВКонтакте
  const ua = navigator.userAgent || "";
  if (/MaxApp|VKApp|vk_app/i.test(ua)) return true;

  return false;
}

export function useMiniApp(): boolean {
  const [miniApp, setMiniApp] = useState(false);

  useEffect(() => {
    setMiniApp(detectMiniApp());
  }, []);

  return miniApp;
}
