"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMyEmployee } from "@/lib/auth/use-my-employee";
import { OrgScopePicker } from "@/components/layout/org-scope-picker";
import { LogoutDialog } from "@/components/auth/logout-dialog";
import {
  Bell, User as UserIcon, Settings, LogOut, Check, Info, AlertTriangle, CheckCheck, Shield, Loader2
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
import { Notification } from "@/lib/types";

const NOTIFICATION_ICONS: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  error: Shield,
  success: Check,
  default: Info
};

export function Header() {
  const { data: session } = useSession();
  const { employee, isLoading: isEmpLoading } = useMyEmployee();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Уведомления пока замоканы — реального эндпоинта нет.
  const isLoading = false;

  const unreadCount = notifications.filter(n => !n.read).length;

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

  useEffect(() => {
    // TODO: NotificationQueryService.ListMyNotifications — medincident-backend#149
    setNotifications([]);
  }, []);

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
              {unreadCount > 0 && !isLoading && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
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
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Пометить все
                </Button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
              ) : notifications.length > 0 ? (
                notifications.slice(0, 3).map((note) => {
                  const Icon = NOTIFICATION_ICONS[note.type] || NOTIFICATION_ICONS.default;
                  const iconColorClass = getIconColor(note.type);

                  return (
                    <DropdownMenuItem key={note.id} className="flex items-start gap-3 p-3 cursor-pointer focus:bg-muted/50 border-b border-border/50 last:border-0">
                      <div className={`mt-1 shrink-0 ${iconColorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium leading-none text-foreground">{note.title}</p>
                          {!note.read && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{note.desc}</p>
                        <p className="text-[10px] text-muted-foreground/60">{note.time}</p>
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