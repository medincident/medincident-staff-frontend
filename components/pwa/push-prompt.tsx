"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getSession, useSession } from "next-auth/react";
import { Bell, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsOpenAPI } from "@/lib/notifications-api";
import { notify } from "@/lib/toast";

// iOS Safari блокирует Notification.requestPermission() без user gesture,
// поэтому показываем soft-prompt: клик пользователя → нативный диалог.

const DISMISS_KEY = "medincident.push-prompt.dismissed-until";
const DISMISS_DAYS = 7;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return until > Date.now();
}

function setDismissed(): void {
  if (typeof localStorage === "undefined") return;
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

async function authHeader(): Promise<Record<string, string>> {
  const session = (await getSession()) as unknown as Record<string, unknown> | null;
  const t =
    (session?.accessToken as string | undefined) ||
    (session?.idToken as string | undefined) ||
    "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function PushPrompt() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (typeof window === "undefined") return;
    if (isDismissed()) return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    // iOS Web Push работает только в установленном PWA.
    if (isIosSafari() && !isStandalonePwa()) return;
    if (!("Notification" in window)) return;

    (async () => {
      if (Notification.permission === "denied") return;
      try {
        const reg = await navigator.serviceWorker.ready;
        if (await reg.pushManager.getSubscription()) return;
      } catch {
        // SW не готов — баннер всё равно покажем
      }
      setVisible(true);
    })();
  }, [status]);

  const enable = useCallback(async () => {
    setIsWorking(true);
    try {
      const vapidPub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPub) {
        notify.error("Ошибка", "VAPID-ключ не настроен.");
        return;
      }

      // Дёргаем синхронно из обработчика клика — иначе Safari не покажет диалог.
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        notify.error(
          "Разрешение не получено",
          "Включить уведомления можно позже в настройках браузера.",
        );
        setDismissed();
        setVisible(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPub) as BufferSource,
      });
      const json = sub.toJSON();

      await axios.post(
        `${NotificationsOpenAPI.BASE}/api/v1/push/subscriptions`,
        {
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          userAgent: navigator.userAgent,
        },
        { headers: await authHeader() },
      );

      notify.success(
        "Уведомления включены",
        "Вы будете получать оповещения о событиях.",
      );
      setVisible(false);
    } catch (err) {
      console.error("Push subscribe failed:", err);
      notify.error("Не удалось включить", "Попробуйте позже из настроек.");
    } finally {
      setIsWorking(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 rounded-xl border bg-card shadow-lg p-4 flex items-start gap-3 bottom-20 md:bottom-4"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="shrink-0 rounded-full bg-primary/10 text-primary p-2">
        <Bell className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <div className="font-semibold text-sm">Включить уведомления?</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Получайте оповещения о новых нежелательных событиях и заявках сразу на это устройство.
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={enable} disabled={isWorking}>
            {isWorking ? "Включаем…" : "Включить"}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Не сейчас
          </Button>
        </div>
      </div>
      <button
        aria-label="Закрыть"
        onClick={dismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground -mr-1 -mt-1 p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
