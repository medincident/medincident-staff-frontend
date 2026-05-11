"use client";

import { toast } from "sonner";

import {
  parseBackendError,
  errorTitle,
  errorDescription,
} from "@/lib/api/error";

const OFFLINE_TITLE = "Вы офлайн";
const OFFLINE_DESCRIPTION =
  "Запрос поставлен в очередь и будет отправлен автоматически при восстановлении сети.";

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export const notify = {
  success(title: string, description?: string) {
    toast.success(title, description ? { description } : undefined);
  },
  error(title: string, description?: string) {
    toast.error(title, description ? { description } : undefined);
  },
  info(title: string, description?: string) {
    toast.info(title, description ? { description } : undefined);
  },
  warning(title: string, description?: string) {
    toast.warning(title, description ? { description } : undefined);
  },
  offline(
    title: string = OFFLINE_TITLE,
    description: string = OFFLINE_DESCRIPTION,
  ) {
    toast.info(title, { description });
  },
  mutationError(title: string, description?: string) {
    if (isOffline()) {
      notify.offline();
      return;
    }
    notify.error(title, description);
  },
  mutationSuccess(title: string, description?: string) {
    if (isOffline()) {
      notify.offline();
      return;
    }
    notify.success(title, description);
  },

  // Распаковывает ошибку с бэка (`v1ErrorResponse`) и показывает осмысленный
  // тост: словарный заголовок по `code`, описание из `message` или списком
  // нарушений валидации. Если форма ответа другая (сетевые сбои, 5xx без
  // тела и т.п.) — fallback'и параметрах.
  apiError(
    err: unknown,
    fallbackTitle = "Не удалось выполнить операцию",
    fallbackDescription?: string,
  ) {
    if (isOffline()) {
      notify.offline();
      return;
    }
    const parsed = parseBackendError(err);
    const title = errorTitle(parsed, fallbackTitle);
    const description = errorDescription(parsed, fallbackDescription);
    notify.error(title, description);
  },
};
