import { BackgroundSyncPlugin } from "workbox-background-sync";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { revision: string | null; url: string }>;
};

const OFFLINE_URL = "/offline";
const PAGES_CACHE = "medincident-pages";
const STATIC_CACHE = "medincident-static";
const IMAGES_CACHE = "medincident-images";
const FONTS_CACHE = "medincident-fonts";

const CRITICAL_ROUTES = ["/", "/dashboard", "/events", "/requests", OFFLINE_URL];

const OFFLINE_HTML_FALLBACK = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MedIncident — нет сети</title>
  <style>
    html, body { margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #1f1f23;
      color: #fff;
      padding: 1rem;
    }
    .card { max-width: 320px; text-align: center; }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    p { color: #aaa; margin: 0 0 1.5rem; font-size: 0.95rem; line-height: 1.4; }
    button {
      padding: 0.75rem 1.5rem;
      background: #6baa3e;
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Нет интернета</h1>
    <p>Похоже, вы не подключены к сети. Проверьте соединение и попробуйте снова.</p>
    <button onclick="location.reload()">Обновить</button>
  </div>
</body>
</html>`;

cleanupOutdatedCaches();

try {
  precacheAndRoute(self.__WB_MANIFEST || []);
} catch (e) {
  console.warn("[SW] precacheAndRoute failed:", e);
}

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      await Promise.allSettled(
        CRITICAL_ROUTES.map((url) =>
          cache.add(
            new Request(url, {
              cache: "reload",
              credentials: "include",
            }),
          ),
        ),
      );
    })(),
  );
});

self.skipWaiting();
clientsClaim();

const bgSyncPlugin = new BackgroundSyncPlugin("medincident-offline-queue", {
  maxRetentionTime: 24 * 60,
});

registerRoute(
  ({ request }: { request: Request }) =>
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "DELETE" ||
    request.method === "PATCH",
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
);

registerRoute(
  ({ url, request }: { url: URL; request: Request }) =>
    url.pathname.startsWith("/_next/static/") ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: STATIC_CACHE,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

registerRoute(
  ({ request }: { request: Request }) => request.destination === "image",
  new CacheFirst({
    cacheName: IMAGES_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request }: { request: Request }) => request.destination === "font",
  new CacheFirst({
    cacheName: FONTS_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
);

const navigationHandler = async ({
  request,
  event,
}: {
  request: Request;
  event?: ExtendableEvent;
}): Promise<Response> => {
  const cache = await caches.open(PAGES_CACHE);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) {
    if (event && typeof event.waitUntil === "function") {
      event.waitUntil(networkPromise);
    }
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  const offline = await cache.match(OFFLINE_URL);
  if (offline) return offline;

  return new Response(OFFLINE_HTML_FALLBACK, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

registerRoute(
  ({ request }: { request: Request }) =>
    request.mode === "navigate" || request.destination === "document",
  navigationHandler,
);

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

self.addEventListener("push", (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();

    const options: ExtendedNotificationOptions = {
      body: data.body,
      icon: "/icon-192.webp",
      badge: "/icon-192.webp",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data.url;

        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
