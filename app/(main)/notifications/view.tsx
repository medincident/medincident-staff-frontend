"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BellOff,
  CheckCheck,
  Clock,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { getIntentColors } from "@/lib/status-helper";
import {
  NotificationService,
  type v1Notification,
} from "@/lib/notifications-api";
import {
  displayNotification,
  notificationDescription,
} from "@/lib/notifications-api/display";
import { useNotificationsStore } from "@/lib/notifications-api/store";

const PAGE_SIZE = 50;

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function NotificationsView() {
  const router = useRouter();

  // Единый стор: пишем сюда, шапка сразу гасит/обновляет красную метку.
  const storeMarkAllRead = useNotificationsStore((s) => s.markAllRead);
  const storeDecrement = useNotificationsStore((s) => s.decrementUnread);
  const storeRefresh = useNotificationsStore((s) => s.refreshUnread);

  const [notifications, setNotifications] = useState<v1Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadFirstPage = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NotificationService.notificationListNotifications(
        undefined,
        PAGE_SIZE,
        undefined,
      );
      setNotifications(res.notifications ?? []);
      setNextCursor(res.nextCursor || undefined);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      notify.apiError(err, "Не удалось загрузить уведомления");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const res = await NotificationService.notificationListNotifications(
        nextCursor,
        PAGE_SIZE,
        undefined,
      );
      setNotifications((prev) => [...prev, ...(res.notifications ?? [])]);
      setNextCursor(res.nextCursor || undefined);
    } catch (err) {
      notify.apiError(err, "Не удалось загрузить ещё");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      storeMarkAllRead(); // оптимистично гасим метку в шапке
      await NotificationService.notificationMarkAllAsRead({});
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })),
      );
      notify.mutationSuccess("Все уведомления отмечены прочитанными");
    } catch (err) {
      storeRefresh(); // ресинк, если бэк не принял
      notify.apiError(err, "Не удалось пометить все");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkOneRead = async (id?: string) => {
    if (!id) return;
    // Оптимистично переключаем флаг — если бэк ответит ошибкой, откатим.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
    );
    storeDecrement(1); // оптимистично уменьшаем счётчик в шапке
    try {
      await NotificationService.notificationMarkAsRead(id, {});
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false, readAt: undefined } : n)),
      );
      storeRefresh(); // ресинк счётчика с сервером
      notify.apiError(err, "Не удалось отметить уведомление");
    }
  };

  // Группировка по дате создания
  const grouped = notifications.reduce((acc, n) => {
    const date = n.createdAt ? formatDateLabel(n.createdAt) : "Без даты";
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {} as Record<string, v1Notification[]>);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 border-b md:static md:border-none md:bg-transparent md:py-0 px-4 md:px-0 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted shrink-0">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground line-clamp-2 break-words">Уведомления</h1>
            <p className="text-sm text-muted-foreground truncate">История системных сообщений</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link href="/notifications/settings">
            <Button variant="ghost" size="icon" className="hover:bg-muted" title="Настройки уведомлений">
              <Settings className="h-5 w-5 text-foreground" />
            </Button>
          </Link>
          {!isLoading && hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="text-primary hover:bg-primary/10"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Пометить все</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <NotificationsSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8 px-4 md:px-0">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center mb-4">
                <Badge variant="outline" className="px-3 py-1">{date}</Badge>
                <div className="h-px bg-border flex-1 ml-4 opacity-50" />
              </div>
              <div className="space-y-3">
                {items.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={() => handleMarkOneRead(n.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "Загрузка..." : "Показать ещё"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: v1Notification;
  onMarkRead: () => void;
}) {
  const { title, intent, icon: Icon, href } = displayNotification(notification);
  const description = notificationDescription(notification);
  const colors = getIntentColors(intent);
  const time = notification.createdAt ? formatTime(notification.createdAt) : "";
  const unread = !notification.isRead;

  const content = (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border bg-card transition-all hover:border-primary/30",
        unread && "bg-accent/5 border-accent/20",
        intent === "error" && `border-destructive/30 ${colors.bg}`,
      )}
    >
      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 border", colors.text, colors.bg, colors.border)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={cn("text-sm font-semibold leading-tight line-clamp-2 break-words", intent === "error" ? colors.text : "text-foreground")}>
            {title}
            {unread && <span className="inline-block w-2 h-2 bg-primary rounded-full ml-1.5 align-middle" />}
          </h4>
          <span className="text-[10px] text-muted-foreground flex items-center bg-muted px-1.5 py-0.5 rounded shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {time}
          </span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">{description}</p>
        )}
      </div>
    </div>
  );

  // Клик по уведомлению должен и переводить на сущность, и помечать как прочитанное.
  if (href) {
    return (
      <Link href={href} onClick={() => unread && onMarkRead()} className="block">
        {content}
      </Link>
    );
  }
  return (
    <div onClick={() => unread && onMarkRead()} className={unread ? "cursor-pointer" : ""}>
      {content}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-8 px-4 md:px-0">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="h-px bg-border flex-1 ml-4 opacity-50" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
      <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
        <BellOff className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-medium text-foreground">Здесь пока тихо</h3>
      <p className="text-muted-foreground mt-2 max-w-xs">
        Новые уведомления о событиях, заявках и изменениях появятся здесь.
      </p>
    </div>
  );
}
