// Ре-экспорт клиента notifications-сервиса с настроенным BASE.
// Отдельный микросервис → собственный singleton OpenAPI.
// BASE: NEXT_PUBLIC_NOTIFICATIONS_API_URL или NEXT_PUBLIC_API_URL минус /api.

import { OpenAPI as NotificationsOpenAPI } from "@/lib/notifications-api-generated";

function deriveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL;
  if (explicit) return explicit;
  const mainApi = process.env.NEXT_PUBLIC_API_URL;
  if (mainApi) return mainApi.replace(/\/api\/?$/, "");
  return "http://localhost:8081";
}

if (typeof window !== "undefined") {
  NotificationsOpenAPI.BASE = deriveOrigin();
  NotificationsOpenAPI.WITH_CREDENTIALS = true;
}

export { NotificationsOpenAPI };
export * from "@/lib/notifications-api-generated";
