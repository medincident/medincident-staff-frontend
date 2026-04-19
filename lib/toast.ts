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
  /**
   * Для catch-блоков мутаций. Если сейчас офлайн — показываем инфо-тост
   * о постановке в очередь (SW это уже обеспечил через BackgroundSyncPlugin),
   * иначе — обычную ошибку.
   */
  mutationError(title: string, description?: string) {
    if (isOffline()) {
      notify.offline();
      return;
    }
    notify.error(title, description);
  },
  /**
   * Для success-пути мутаций. Если сейчас офлайн — пишем, что запрос
   * поставлен в очередь (т.к. на самом деле он ещё не ушёл на сервер),
   * иначе — обычный успех. Нужен, в частности, потому что мок-мутации в
   * формах ничего не бросают и catch-блок не срабатывает.
   */
  mutationSuccess(title: string, description?: string) {
    if (isOffline()) {
      notify.offline();
      return;
    }
    notify.success(title, description);
  },
};
