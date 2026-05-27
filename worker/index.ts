// Custom Service Worker addon for @ducanh2912/next-pwa.
// next-pwa автоматически подхватывает worker/index.ts и склеивает с основным
// Workbox sw.js через importScripts. Здесь живут push-обработчики и
// notificationclick — основной sw.js их не имеет.

/// <reference lib="webworker" />

// `self` в SW-контексте — это ServiceWorkerGlobalScope. tsconfig глобально
// объявляет его как Window, поэтому делаем локальный alias через unknown-cast.
const sw = self as unknown as ServiceWorkerGlobalScope;

interface PushPayload {
  title?: string;
  body?: string;
  tag?: string;
  data?: { url?: string };
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

  // iOS Safari молча отбрасывает уведомление, если title или body пустые.
  const title = (typeof payload.title === "string" && payload.title.trim()) || "MedIncident";
  const body =
    (typeof payload.body === "string" && payload.body.trim()) ||
    "Открыть приложение для деталей";

  // PNG, не WebP: iOS Safari в SW context не всегда декодирует WebP.
  const options: ExtendedNotificationOptions = {
    body,
    icon: "/apple-icon.png",
    badge: "/apple-icon.png",
    tag: payload.tag,
    data: {
      url: payload.data?.url || payload.url || "/",
    },
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
