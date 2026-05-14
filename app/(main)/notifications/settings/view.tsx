"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, BellRing, Mail, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { notify } from "@/lib/toast";
import {
  NotificationService,
  v1NotificationType,
  type v1NotificationTypeSetting,
  type v1QuietHours,
} from "@/lib/notifications-api";

// Группировка типов по разделам — для понятного UI вместо плоского списка
// из 23 переключателей.
const TYPE_GROUPS: Array<{
  title: string;
  description: string;
  types: Array<{ type: v1NotificationType; label: string }>;
}> = [
  {
    title: "Нежелательные события",
    description: "Регистрация и изменение НС",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_INCIDENT_CREATED, label: "Зарегистрировано НС" },
      { type: v1NotificationType.NOTIFICATION_TYPE_INCIDENT_STATUS_CHANGED, label: "Изменён статус НС" },
      { type: v1NotificationType.NOTIFICATION_TYPE_INCIDENT_PRIORITY_CHANGED, label: "Изменён приоритет НС" },
      { type: v1NotificationType.NOTIFICATION_TYPE_INCIDENT_DESCRIPTION_UPDATED, label: "Обновлено описание НС" },
    ],
  },
  {
    title: "Заявки на обслуживание",
    description: "Создание, назначение, изменение статуса",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_CREATED, label: "Новая заявка" },
      { type: v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_STATUS_CHANGED, label: "Изменён статус заявки" },
      { type: v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_EXECUTOR_ASSIGNED, label: "Назначен исполнитель" },
      { type: v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_EXECUTOR_REMOVED, label: "Исполнитель снят" },
    ],
  },
  {
    title: "Отпуска",
    description: "Планирование и изменение отпусков",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_VACATION_SCHEDULED, label: "Отпуск запланирован" },
      { type: v1NotificationType.NOTIFICATION_TYPE_VACATION_STARTED, label: "Отпуск начался" },
      { type: v1NotificationType.NOTIFICATION_TYPE_VACATION_ENDED, label: "Отпуск завершён" },
      { type: v1NotificationType.NOTIFICATION_TYPE_VACATION_CANCELLED, label: "Отпуск отменён" },
      { type: v1NotificationType.NOTIFICATION_TYPE_VACATION_END_DATE_CHANGED, label: "Изменена дата окончания" },
    ],
  },
  {
    title: "Сотрудники",
    description: "Найм, увольнения, переводы",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_HIRED, label: "Принят на работу" },
      { type: v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_TERMINATED, label: "Уволен" },
      { type: v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_DEPARTMENT_CHANGED, label: "Переведён в другое отделение" },
      { type: v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_POSITION_CHANGED, label: "Изменилась должность" },
    ],
  },
  {
    title: "Роли",
    description: "Назначение и отзыв ролей",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_ROLE_ASSIGNED, label: "Роль назначена" },
      { type: v1NotificationType.NOTIFICATION_TYPE_ROLE_REVOKED, label: "Роль отозвана" },
    ],
  },
  {
    title: "Системный администратор",
    description: "Выдача и отзыв системных прав",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_SYSTEM_ADMIN_GRANTED, label: "Выданы права sys-admin" },
      { type: v1NotificationType.NOTIFICATION_TYPE_SYSTEM_ADMIN_REVOKED, label: "Права sys-admin отозваны" },
    ],
  },
  {
    title: "Безопасность",
    description: "Эти уведомления приходят всегда — обходят тихие часы",
    types: [
      { type: v1NotificationType.NOTIFICATION_TYPE_SECURITY_NEW_LOGIN, label: "Вход с нового устройства" },
      { type: v1NotificationType.NOTIFICATION_TYPE_SECURITY_EMAIL_CHANGED, label: "Изменён e-mail аккаунта" },
    ],
  },
];

const ALL_TYPES = TYPE_GROUPS.flatMap((g) => g.types.map((t) => t.type));

// Топ-5 RF-таймзон + автоматическая из браузера; пользователь редко мигрирует
// между зонами, расширять список можно по мере появления реальных запросов.
const TIMEZONE_OPTIONS = [
  "Europe/Moscow",
  "Europe/Kaliningrad",
  "Asia/Yekaterinburg",
  "Asia/Krasnoyarsk",
  "Asia/Yakutsk",
  "Asia/Vladivostok",
  "Asia/Magadan",
  "Asia/Kamchatka",
];

export function NotificationSettingsView() {
  const router = useRouter();

  // По-типу: Map<NotificationType, { push, email }>
  const [settings, setSettings] = useState<Record<string, { push: boolean; email: boolean }>>({});
  const [quietHours, setQuietHours] = useState<v1QuietHours>({
    startTime: "22:00",
    endTime: "08:00",
    timezone: "Europe/Moscow",
    weekendSilent: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [settingsRes, quietRes] = await Promise.all([
          NotificationService.notificationGetSettings(),
          NotificationService.notificationGetQuietHours(),
        ]);
        const map: Record<string, { push: boolean; email: boolean }> = {};
        // Если для типа нет записи в БД — считаем, что включено по дефолту
        // (то же поведение, что и на бэке: см. internal/service/notification/settings.go).
        for (const t of ALL_TYPES) {
          map[t] = { push: true, email: true };
        }
        for (const s of settingsRes.settings ?? []) {
          if (s.type) {
            map[s.type] = {
              push: s.pushEnabled ?? true,
              email: s.emailEnabled ?? true,
            };
          }
        }
        setSettings(map);
        if (quietRes.quietHours) {
          setQuietHours({
            startTime: quietRes.quietHours.startTime || "22:00",
            endTime: quietRes.quietHours.endTime || "08:00",
            timezone:
              quietRes.quietHours.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              "Europe/Moscow",
            weekendSilent: quietRes.quietHours.weekendSilent ?? false,
          });
        }
      } catch (err) {
        notify.apiError(err, "Не удалось загрузить настройки");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (type: v1NotificationType, channel: "push" | "email", value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [type]: { ...(prev[type] ?? { push: true, email: true }), [channel]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: v1NotificationTypeSetting[] = ALL_TYPES.map((t) => ({
        type: t,
        pushEnabled: settings[t]?.push ?? true,
        emailEnabled: settings[t]?.email ?? true,
      }));
      await Promise.all([
        NotificationService.notificationUpdateSettings({ settings: payload }),
        NotificationService.notificationUpdateQuietHours({ quietHours }),
      ]);
      notify.mutationSuccess("Настройки сохранены");
    } catch (err) {
      notify.apiError(err, "Не удалось сохранить настройки");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Настройки уведомлений</h1>
          <p className="text-sm text-muted-foreground">
            Push и e-mail по типам событий + тихие часы
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* QUIET HOURS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                Тихие часы
              </CardTitle>
              <CardDescription>
                В этот период push-уведомления не приходят. Безопасность (вход с нового
                устройства, смена e-mail) обходит тихие часы.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Начало</Label>
                  <Input
                    type="time"
                    value={quietHours.startTime}
                    onChange={(e) => setQuietHours({ ...quietHours, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Конец</Label>
                  <Input
                    type="time"
                    value={quietHours.endTime}
                    onChange={(e) => setQuietHours({ ...quietHours, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Часовой пояс</Label>
                <SearchableSelect
                  options={TIMEZONE_OPTIONS.map((tz) => ({ value: tz, label: tz }))}
                  value={quietHours.timezone}
                  onChange={(v) => setQuietHours({ ...quietHours, timezone: v })}
                  placeholder="Выберите часовой пояс"
                />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <div>
                  <span className="text-sm font-medium text-foreground">Тихие выходные</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Сб и Вс — полностью без push (вне зависимости от времени)
                  </p>
                </div>
                <Switch
                  checked={quietHours.weekendSilent ?? false}
                  onCheckedChange={(v) => setQuietHours({ ...quietHours, weekendSilent: v })}
                />
              </label>
            </CardContent>
          </Card>

          {/* TYPE SETTINGS */}
          {TYPE_GROUPS.map((group) => {
            const isSecurity = group.title === "Безопасность";
            return (
              <Card key={group.title}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {isSecurity && <ShieldAlert className="h-4 w-4 text-warning" />}
                    {group.title}
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-0 items-center text-[11px] text-muted-foreground uppercase tracking-wider pb-2 border-b">
                      <span>Событие</span>
                      <span className="flex items-center gap-1"><BellRing className="h-3 w-3" />Push</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />Email</span>
                    </div>
                    {group.types.map(({ type, label }) => {
                      const s = settings[type] ?? { push: true, email: true };
                      return (
                        <div
                          key={type}
                          className="grid grid-cols-[1fr_auto_auto] gap-x-6 items-center py-2.5 border-b last:border-0"
                        >
                          <span className="text-sm text-foreground">{label}</span>
                          <Switch checked={s.push} onCheckedChange={(v) => toggle(type, "push", v)} />
                          <Switch checked={s.email} onCheckedChange={(v) => toggle(type, "email", v)} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Сохранить настройки
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
