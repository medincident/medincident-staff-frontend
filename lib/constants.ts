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

export const STATUS_MAP: Record<string, string> = {
  created: "Принята",
  processed: "Обработана",
  in_work: "В работе",
  purchase: "Закупка запчастей",
  completed: "Выполнена",
  refused: "Отказ",
  cancelled: "Отмена",
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

export const EVENT_STATUS_MAP: Record<EventStatus | string, string> = {
  created: "Принята",
  in_work: "В работе",
  investigation: "Расследование",
  measures: "Меры приняты",
  check: "Проверка",
  completed: "Завершено",
  closed: "Закрыто",
};
