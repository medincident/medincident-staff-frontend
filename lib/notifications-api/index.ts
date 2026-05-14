// Канонический ре-экспорт сгенерированного клиента notifications-сервиса
// и установка OpenAPI.BASE.
//
// Notifications — отдельный микросервис (отдельный gateway), поэтому у него
// собственный singleton `OpenAPI` (`lib/notifications-api-generated/core/OpenAPI.ts`).
// Чтобы не путать с main-клиентом (`lib/api-generated`), импортируйте всегда
// через этот модуль: `import { NotificationService } from "@/lib/notifications-api";`
//
// BASE по умолчанию выводится из главного `NEXT_PUBLIC_API_URL` отбрасыванием
// хвоста `/api` (notifications-swagger возвращает пути уже с префиксом
// `/api/v1/notifications/...`). Если notifications хостится на отдельном
// домене — задайте `NEXT_PUBLIC_NOTIFICATIONS_API_URL` явно.

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
