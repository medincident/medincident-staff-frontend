export const SCOPES = {
  // Заявки
  REQUESTS_CREATE: "requests:create",
  REQUESTS_READ_OWN: "requests:read:own",
  REQUESTS_READ_DEPT: "requests:read:department",
  REQUESTS_READ_CLINIC: "requests:read:clinic",
  REQUESTS_READ_ALL: "requests:read:all",
  REQUESTS_MANAGE: "requests:manage", // Для диспетчера заявок

  // Нежелательные события (НС)
  INCIDENTS_CREATE: "incidents:create",
  INCIDENTS_READ_OWN: "incidents:read:own",
  INCIDENTS_READ_DEPT: "incidents:read:department",
  INCIDENTS_READ_CLINIC: "incidents:read:clinic",
  INCIDENTS_READ_ALL: "incidents:read:all",
  INCIDENTS_MANAGE: "incidents:manage", // Для диспетчера НС

  // Аналитика и Админка
  ANALYTICS_READ: "analytics:read", // Для гостя и админов
  ADMIN_ORG: "admin:org", // Администратор организации
  ADMIN_SYSTEM: "admin:system", // Администратор системы
} as const;

export type Scope = (typeof SCOPES)[keyof typeof SCOPES];
