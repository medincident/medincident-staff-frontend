"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Bell,
  Mail,
  Moon,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { id: 0, label: "Пн" },
  { id: 1, label: "Вт" },
  { id: 2, label: "Ср" },
  { id: 3, label: "Чт" },
  { id: 4, label: "Пт" },
  { id: 5, label: "Сб" },
  { id: 6, label: "Вс" },
];

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [settings, setSettings] = useState({
    emailNotification: false,
    quietMode: {
      enabled: false,
      from: "22:00",
      to: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6]
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            ...data,
            quietMode: {
              ...data.quietMode,
              days: data.quietMode.days || prev.quietMode.days
            }
          }));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Ошибка", { description: "Не удалось загрузить настройки" });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success("Успешно", { description: "Настройки сохранены!" });
      router.back();
    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось сохранить настройки" });
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setSettings((prev) => {
      const currentDays = prev.quietMode.days;
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter((id: number) => id !== dayId)
        : [...currentDays, dayId];

      newDays.sort((a: number, b: number) => a - b);

      return {
        ...prev,
        quietMode: {
          ...prev.quietMode,
          days: newDays,
        },
      };
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">

      {/* HEADER: Виден всегда */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Общие настройки</h1>
          <p className="text-sm text-muted-foreground">Время и режим уведомлений</p>
        </div>
      </div>

      {initialLoading ? (
        /* --- SKELETON STATE (Точная копия карточки Уведомлений) --- */
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
             
             {/* Header Skeleton */}
             <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="flex items-center gap-3">
                   <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                   <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-56" />
                   </div>
                </div>
             </div>

             {/* Content Skeleton */}
             <div className="p-6 pt-0 pb-3 space-y-0">
                
                {/* Row 1: Email */}
                <div className="py-4 flex items-center justify-between border-b">
                   <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-3 w-40" />
                      </div>
                   </div>
                   <Skeleton className="h-6 w-11 rounded-full" />
                </div>

                {/* Row 2: Quiet Mode */}
                <div className="py-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-40" />
                         <Skeleton className="h-3 w-48" />
                      </div>
                   </div>
                   <Skeleton className="h-6 w-11 rounded-full" />
                </div>
             </div>
          </div>

          {/* Button Skeleton */}
          <div className="flex justify-end pt-4">
             <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
          </div>
        </div>
      ) : (
        /* --- REAL CONTENT --- */
        <>
          <Card className="bg-card pb-2!">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-foreground">Уведомления</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">Настройка оповещений и режима тишины</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border">

              <div className="py-4 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-base text-foreground">Email оповещения</Label>
                    <p className="text-xs text-muted-foreground">Получать сводку на почту</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotification}
                  onCheckedChange={(v) => setSettings({ ...settings, emailNotification: v })}
                />
              </div>

              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div>
                      <Label className="text-base text-foreground">Режим "Не беспокоить"</Label>
                      <p className="text-xs text-muted-foreground">Отключать уведомления ночью</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.quietMode.enabled}
                    onCheckedChange={(v) => setSettings({ ...settings, quietMode: { ...settings.quietMode, enabled: v } })}
                  />
                </div>

                {settings.quietMode.enabled && (
                  <div className="space-y-4 pl-14 animate-in fade-in slide-in-from-top-1">
                    {/* Выбор времени */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs text-muted-foreground">С (время)</Label>
                        <Input
                          type="time"
                          className="bg-background border-input"
                          value={settings.quietMode.from}
                          onChange={(e) => setSettings({ ...settings, quietMode: { ...settings.quietMode, from: e.target.value } })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs text-muted-foreground">До (время)</Label>
                        <Input
                          type="time"
                          className="bg-background border-input"
                          value={settings.quietMode.to}
                          onChange={(e) => setSettings({ ...settings, quietMode: { ...settings.quietMode, to: e.target.value } })}
                        />
                      </div>
                    </div>

                    {/* Выбор дней недели */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-muted-foreground">Повторять по дням</Label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map((day) => {
                          const isSelected = settings.quietMode.days.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              onClick={() => toggleDay(day.id)}
                              type="button"
                              className={cn(
                                "h-9 w-9 rounded-full text-xs font-medium transition-all border flex items-center justify-center",
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:bg-muted/50"
                              )}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}