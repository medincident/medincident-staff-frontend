"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMyEmployee } from "@/lib/auth/use-my-employee";
import { OrgScopePicker } from "@/components/layout/org-scope-picker";
import { LogoutDialog } from "@/components/auth/logout-dialog";
import {
  Bell, User as UserIcon, Settings, LogOut, CheckCheck, Loader2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIconColor } from "@/lib/status-helper";
import { APP_CONFIG } from "@/lib/constants";
import { MedIncidentLogo } from "@/components/icons/med-incident-logo";
import {
  NotificationService,
  type v1Notification,
} from "@/lib/notifications-api";
import {
  displayNotification,
  notificationDescription,
} from "@/lib/notifications-api/display";

// Сколько свежих уведомлений показываем в дроп-дауне шапки.
const HEADER_PREVIEW_LIMIT = 5;
// Периодичность поллинга бейджа непрочитанных (мс). Мини-нагрузка, но без
// SSE/WebSocket пока нет другого способа узнать о новых уведомлениях.
const UNREAD_POLL_INTERVAL_MS = 30_000;

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { employee, isLoading: isEmpLoading } = useMyEmployee();
  const [unreadCount, setUnreadCount] = useState(0);
  const [previewItems, setPreviewItems] = useState<v1Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const refreshUnread = useCallback(async () => {
    try {
      const res = await NotificationService.notificationGetUnreadCount();
      const c = Number(res.count ?? 0);
      setUnreadCount(Number.isFinite(c) ? c : 0);
    } catch {
      // Тихо игнорируем — бейдж не критичен.
    }
  }, []);

  const loadPreview = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NotificationService.notificationListNotifications(
        undefined,
        HEADER_PREVIEW_LIMIT,
        undefined,
      );
      setPreviewItems(res.notifications ?? []);
    } catch {
      setPreviewItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    loadPreview();
    const id = window.setInterval(refreshUnread, UNREAD_POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refreshUnread, loadPreview]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await NotificationService.notificationMarkAllAsRead({});
      setUnreadCount(0);
      setPreviewItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleItemClick = async (n: v1Notification) => {
    // Помечаем прочитанным оптимистично и переходим на сущность, если есть.
    if (!n.isRead && n.id) {
      setPreviewItems((prev) =>
        prev.map((it) => (it.id === n.id ? { ...it, isRead: true } : it)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      NotificationService.notificationMarkAsRead(n.id, {}).catch(() => {
        // откатываем при ошибке
        setPreviewItems((prev) =>
          prev.map((it) => (it.id === n.id ? { ...it, isRead: false } : it)),
        );
        setUnreadCount((c) => c + 1);
      });
    }
    const { href } = displayNotification(n);
    if (href) router.push(href);
  };

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const openLogoutDialog = () => setIsLogoutDialogOpen(true);

  const user = session?.user as any;
  // ФИО / e-mail берём с бэка (employee_cards). Аватарку — из Zitadel,
  // в нашей доменной модели её нет.
  const displayName =
    employee?.displayName ||
    [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    "Пользователь";
  const displayEmail = employee?.email || user?.email;

  return (
    <header className="bg-card border-b sticky top-0 z-30 h-14 px-4 flex justify-between items-center transition-colors duration-300">

      {/* ЛОГОТИП / НАЗВАНИЕ */}
      <div className="flex items-center gap-3">
        <div className="flex md:hidden items-center">
          <div className="h-9 w-9 flex items-center justify-center">
            <MedIncidentLogo className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">{APP_CONFIG.name}</span>
        </div>
        <h2 className="hidden md:block text-sm font-semibold text-muted-foreground">
          {APP_CONFIG.description}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">

        {/* --- УВЕДОМЛЕНИЯ --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] leading-none font-bold rounded-full border-2 border-card flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-card border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm text-foreground">Уведомления</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-[10px] text-primary hover:bg-primary/10"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Пометить все
                </Button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
              ) : previewItems.length > 0 ? (
                previewItems.map((n) => {
                  const { title, icon: Icon, intent } = displayNotification(n);
                  const desc = notificationDescription(n);
                  const iconColor = getIconColor(intent);
                  const time = n.createdAt
                    ? new Date(n.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
                    : "";
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className="flex items-start gap-3 p-3 cursor-pointer focus:bg-muted/50 border-b border-border/50 last:border-0"
                    >
                      <div className={`mt-1 shrink-0 ${iconColor}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-medium leading-none text-foreground line-clamp-2 break-words">
                            {title}
                          </p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                        {desc && <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>}
                        <p className="text-[10px] text-muted-foreground/60">{time}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">Нет новых уведомлений</div>
              )}
            </div>
            <div className="p-2 border-t border-border text-center">
              <Link href="/notifications" className="text-xs font-medium text-primary hover:underline">
                Показать все
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* --- ПОЛЬЗОВАТЕЛЬ --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8 border border-border">
                {user?.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {isEmpLoading
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : (getUserInitials(displayName))
                  }
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {isEmpLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium leading-none text-foreground">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">{displayEmail || "Email не указан"}</p>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Workspace switcher на мобиле — на десктопе он живёт в сайдбаре,
                здесь не дублируем. */}
            <div className="md:hidden px-2 pt-1.5 pb-2">
              <p className="px-1 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Организация
              </p>
              <OrgScopePicker />
            </div>
            <DropdownMenuSeparator className="md:hidden" />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Профиль</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/profile/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Настройки</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={openLogoutDialog}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      <LogoutDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        idToken={(session as any)?.idToken}
      />
    </header>
  );
}