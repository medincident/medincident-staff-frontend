/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkOnly, type PrecacheEntry } from "serwist";

declare global {
  // Serwist подставляет сюда precache-манифест при сборке. Ссылка должна
  // быть буквально `self.__SW_MANIFEST` — плагин ищет её текстом.
  // eslint-disable-next-line no-var
  var __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // /api/auth/* — только сеть: повторный fetch одного auth-кода в Zitadel
    // ловит Errors.AuthRequest.NoCode.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/auth"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// `self` в SW — ServiceWorkerGlobalScope; tsconfig тянет и dom-lib, поэтому
// для push-API приводим через unknown-cast (литеральный self нужен только выше).
const sw = self as unknown as ServiceWorkerGlobalScope;

// ─── Push ────────────────────────────────────────────────────────────────
interface PushPayload {
  title?: string;
  body?: string;
  tag?: string;
  data?: { url?: string; is_security?: boolean };
  url?: string;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

sw.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: PushPayload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "MedIncident", body: event.data.text() || "Новое уведомление" };
  }

  // iOS Safari молча режет уведомления с пустым title или body.
  const title = (typeof payload.title === "string" && payload.title.trim()) || "MedIncident";
  const body =
    (typeof payload.body === "string" && payload.body.trim()) ||
    "Откройте приложение, чтобы увидеть детали.";

  // WebP в Service Worker context на iOS декодируется ненадёжно, используем PNG.
  const options: ExtendedNotificationOptions = {
    body,
    icon: "/icons/apple-icon.png",
    badge: "/icons/apple-icon.png",
    tag: payload.tag,
    requireInteraction: payload.data?.is_security === true,
    data: { url: payload.data?.url || payload.url || "/" },
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";

  event.waitUntil(
    sw.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.endsWith(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(url);
        }
      }),
  );
});
