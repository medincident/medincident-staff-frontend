"use client";

import { create } from "zustand";

import { NotificationService } from "@/lib/notifications-api";

// Общий store счётчика непрочитанных. Шапка и страница уведомлений читают отсюда.
interface NotificationsState {
  unreadCount: number;
  /** Жёстко выставить значение (после ответа сервера). */
  setUnreadCount: (n: number) => void;
  /** Оптимистично уменьшить на `by` (прочли одно). Не уходит ниже 0. */
  decrementUnread: (by?: number) => void;
  /** Оптимистично обнулить (пометили все прочитанными). */
  markAllRead: () => void;
  /** Перезапросить актуальное значение с сервера. */
  refreshUnread: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (n) =>
    set({ unreadCount: Number.isFinite(n) && n > 0 ? Math.floor(n) : 0 }),

  decrementUnread: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

  markAllRead: () => set({ unreadCount: 0 }),

  refreshUnread: async () => {
    try {
      const res = await NotificationService.notificationGetUnreadCount();
      const c = Number(res.count ?? 0);
      set({ unreadCount: Number.isFinite(c) && c > 0 ? Math.floor(c) : 0 });
    } catch {
      // Бейдж не критичен — молча игнорируем сбой.
    }
  },
}));
