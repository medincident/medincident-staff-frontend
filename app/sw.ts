/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
  type PrecacheEntry,
  type RouteHandler,
} from "serwist";

declare global {
  // Serwist подставляет сюда precache-манифест при сборке. Ссылка должна
  // быть буквально `self.__SW_MANIFEST` — плагин ищет её текстом.
  // eslint-disable-next-line no-var
  var __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
}

// Кастомный handler для /api/auth/*: try/catch с гарантированным Response.
// На iOS Safari чистый NetworkOnly при отказе сети reject'ит промис в
// respondWith → «FetchEvent.respondWith received an error: no response url».
const authNetworkOnly: RouteHandler = async ({ request }) => {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({ error: "offline", message: "Нет соединения с сервером" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  }
};

// Navigation: быстрый таймаут на сеть (3 сек), потом из кеша, иначе /offline.
// На iOS Safari дефолтный NetworkFirst ждёт до зависания TCP — приложение
// «висит» при потере связи десятками секунд. С networkTimeoutSeconds=3
// при оффлайне страница отдаётся из кеша мгновенно.
const navigationHandler = new NetworkFirst({
  cacheName: "navigation-cache",
  networkTimeoutSeconds: 3,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 64,
      maxAgeSeconds: 7 * 24 * 60 * 60,
    }),
  ],
});

// /api/* (GET) — те же 3 секунды + долгий кеш для оффлайн-просмотра.
const apiGetHandler = new NetworkFirst({
  cacheName: "api-cache",
  networkTimeoutSeconds: 3,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60,
    }),
  ],
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Фолбэк для navigation-запросов: если страница недоступна в кеше и сеть
  // упала, отдаём /offline вместо «no response url» на iOS.
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
  runtimeCaching: [
    // /api/auth/* — особый случай (см. authNetworkOnly).
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/auth"),
      handler: authNetworkOnly,
    },
    // /api/v1/* GET — кешируем для оффлайн-просмотра.
    {
      matcher: ({ url, request, sameOrigin }) =>
        sameOrigin &&
        url.pathname.startsWith("/api/") &&
        request.method === "GET",
      handler: apiGetHandler,
      method: "GET",
    },
    // Все navigation-запросы — короткий таймаут + кеш.
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: navigationHandler,
    },
    // RSC prefetch и динамические данные Next.js — StaleWhileRevalidate
    // быстрее, чем NetworkFirst дефолтного defaultCache.
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/data"),
      handler: new StaleWhileRevalidate({ cacheName: "next-data" }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// `self` в SW — ServiceWorkerGlobalScope; tsconfig тянет и dom-lib, поэтому
// для push-API приводим через unknown-cast (литеральный self нужен только выше).
const sw = self as unknown as ServiceWorkerGlobalScope;

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
