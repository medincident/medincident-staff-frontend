import { BackgroundSyncPlugin } from "workbox-background-sync";
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();

const bgSyncPlugin = new BackgroundSyncPlugin("medincident-offline-queue", {
  maxRetentionTime: 24 * 60,
});

registerRoute(
  ({ request }) =>
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "DELETE" ||
    request.method === "PATCH",
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
);

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();

    const options: ExtendedNotificationOptions = {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
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
