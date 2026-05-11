"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Settings,
  HelpCircle,
  ExternalLink,
  UserCog,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  Mail,
  Building,
  Briefcase,
  Palette,
  Accessibility
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { LogoutDialog } from "@/components/auth/logout-dialog";
import { useMyEmployee } from "@/lib/auth/use-my-employee";
import { useMyIdentity } from "@/lib/auth/use-my-identity";
import { useMyOrgRole } from "@/lib/auth/use-my-org-role";

export function ProfileView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const { employee, isLoading } = useMyEmployee();

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user as any;
  const { identity } = useMyIdentity();
  const { role } = useMyOrgRole();
  const isAdmin = !!identity?.isSystemAdmin || role.isOrgAdmin;

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const handleLogout = () => setIsLogoutDialogOpen(true);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Профиль</h1>
            <p className="text-muted-foreground mt-1">Управление аккаунтом и настройки</p>
          </div>
          <Button
            variant="outline"
            disabled={true}
            className="hidden md:flex text-destructive border-destructive/20 opacity-50 cursor-not-allowed"
          >
            <LogOut className="mr-2 h-4 w-4" /> Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-xl border bg-card text-card-foreground overflow-hidden gap-6 py-0">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="px-6 pb-6 relative">
                <div className="-mt-22 mb-4 flex justify-between items-end">
                  <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
                  <Skeleton className="h-6 w-20 rounded-full mb-2" />
                </div>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-4 rounded-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Параметры
              </h3>
              <div className="rounded-xl border bg-card p-2 space-y-1">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-12.25 w-full rounded-lg" />
                </div>
                <Separator className="my-1 opacity-50" />
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center p-4 gap-4">
                    <Skeleton className="h-10.5 w-10 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden pt-4">
              <Button variant="destructive" size="lg" className="w-full" disabled>
                <LogOut className="mr-2 h-4 w-4" />
                Выйти из аккаунта
              </Button>
              <div className="flex justify-center mt-6">
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ФИО / должность / клиника / отделение — с бэка (employee_cards).
  // Аватар — из Zitadel (в нашей доменной модели его нет).
  const displayName =
    employee?.displayName ||
    [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "Пользователь";
  const displayEmail = employee?.email || user.email;
  const roleName = isAdmin ? "Администратор" : "Сотрудник";
  const positionName = employee?.position || "Сотрудник";
  const clinicName = employee?.clinicName || "Клиника не указана";
  const departmentName = employee?.departmentName || "Отделение не указано";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Профиль</h1>
          <p className="text-muted-foreground mt-1">Управление аккаунтом и настройки</p>
        </div>
        <Button
          variant="outline"
          className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Выйти
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <Card className="overflow-hidden py-0!">
            <div className="h-32 bg-gradient-to-b from-primary/20 via-primary/5 to-card" />

            <CardContent className="px-6 pb-6 relative">
              <div className="-mt-28 mb-4 flex justify-between items-end">
                <Avatar className="h-24 w-24 border-4 border-card bg-background">
                  {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <Badge variant={isAdmin ? "default" : "secondary"} className="mb-2">
                  {roleName}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">{displayName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">ID: {user.id}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Briefcase className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="text-foreground">{positionName}</span>
                  </div>
                  {!isAdmin && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Building className="h-4 w-4 shrink-0 opacity-70 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-foreground">{clinicName}</span>
                        <span className="text-xs">{departmentName}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="text-foreground">{displayEmail || "Email не указан"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Параметры
            </h3>
            <Card className="py-0!">
              <CardContent className="p-2 space-y-1">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Внешний вид</p>
                      <p className="text-xs text-muted-foreground">Цветовая схема интерфейса</p>
                    </div>
                  </div>

                  {mounted && (
                    <div className="bg-muted/50 p-1.5 rounded-xl flex items-center justify-between mt-1">
                      {[
                        { id: 'light', icon: Sun, label: 'Светлая' },
                        { id: 'dark', icon: Moon, label: 'Темная' },
                        { id: 'system', icon: Laptop, label: 'Авто' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all duration-200",
                            theme === t.id
                              ? "bg-background text-foreground ring-1 ring-black/5 dark:ring-white/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                          )}
                        >
                          <t.icon className="h-3.5 w-3.5" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="my-1 opacity-50" />

                <ProfileLink
                  href={`${process.env.NEXT_PUBLIC_ZITADEL_ISSUER}/profile/details`}
                  icon={UserCog}
                  title="Полный профиль"
                  desc="Управление данными аккаунта"
                  external
                />

                <ProfileLink
                  href="/profile/settings"
                  icon={Settings}
                  title="Общие настройки"
                  desc="Уведомления, пароль и безопасность"
                />

                <ProfileLink
                  href="/profile/accessibility"
                  icon={Accessibility}
                  title="Специальные возможности"
                  desc="Чёрно-белый режим и размер шрифта"
                />

                <ProfileLink
                  href="/profile/help"
                  icon={HelpCircle}
                  title="Помощь и справка"
                  desc="Инструкции по работе с системой"
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:hidden pt-4">
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти из аккаунта
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-6">Версия системы {APP_CONFIG?.version || "1.0.0"}</p>
          </div>
        </div>
      </div>

      <LogoutDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        idToken={(session as any)?.idToken}
      />
    </div>
  );
}

const ProfileLink = ({
  href,
  icon: Icon,
  title,
  desc,
  colorClass = "bg-muted text-muted-foreground",
  external = false,
}: any) => {
  const className = cn(
    "flex items-center justify-between p-4 rounded-xl transition-all duration-200 group border border-transparent",
  );

  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-lg transition-colors", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {external ? (
        <ExternalLink className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
};
