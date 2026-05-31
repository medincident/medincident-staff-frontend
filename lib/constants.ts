import { EventStatus, Priority } from "./types";

export const APP_CONFIG = {
  name: "МедИнцидент",
  description: "Система мониторинга НС",
  version: "1.0.0",
  year: 2026,
};

export const THEME_COLORS = {
  light: "#ffffff",
  dark: "#1f1f23",
} as const;

// Бэк (domain.request_status): created, in_work, on_hold, pending_review,
// completed, cancelled.
export const STATUS_MAP: Record<string, string> = {
  created: "Принята",
  in_work: "В работе",
  on_hold: "Приостановлена",
  pending_review: "На проверке",
  completed: "Выполнена",
  cancelled: "Отменена",
};

export const PRIORITY_MAP: Record<Priority, string> = {
  normal: "Обычный",
  high: "Срочный",
  critical: "Критический",
};

// Приоритет НС — отдельная шкала (есть `low`, в отличие от заявок).
export const INCIDENT_PRIORITY_MAP: Record<string, string> = {
  low: "Низкий",
  normal: "Обычный",
  high: "Высокий",
  critical: "Критический",
};

// Ключи нормализованы из INCIDENT_STATUS_* (lower, без префикса).
export const EVENT_STATUS_MAP: Record<EventStatus | string, string> = {
  pending: "Ожидает",
  in_progress: "В работе",
  done: "Решено",
  rejected: "Отклонено",
  cancelled: "Отменено",
};
