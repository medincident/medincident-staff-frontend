"use client";

import { toast } from "sonner";

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
};
