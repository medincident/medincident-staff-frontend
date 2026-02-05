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
import { UserSettings } from "@/lib/types";

// Импорт сервисов
import { getSettings, saveSettings } from "@/lib/services/settings";

const WEEKDAYS = [
  { id: 0, label: "Пн" },
  { id: 1, label: "Вт" },
  { id: 2, label: "Ср" },
  { id: 3, label: "Чт" },
  { id: 4, label: "Пт" },
  { id: 5, label: "Сб" },
  { id: 6, label: "Вс" },
];

export function SettingsView() {
  const router = useRouter();
  
  // --- STATE ---
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Не удалось загрузить настройки");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await saveSettings(settings);
      toast.success("Успешно", { description: "Настройки сохранены!" });
      router.refresh(); 
    } catch (error) {
      console.error(error);
      toast.error("Ошибка", { description: "Не удалось сохранить настройки" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (dayId: number) => {
    if (!settings) return;
    
    setSettings((prev) => {
      if (!prev) return null;
      
      const currentDays = prev.quietMode.days;
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter((id) => id !== dayId)
        : [...currentDays, dayId];

      newDays.sort((a, b) => a - b);

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

      {/* HEADER: Всегда видим (без скелетонов) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Общие настройки</h1>
            <p className="text-sm text-muted-foreground">Время и режим уведомлений</p>
          </div>
        </div>
        
        <Button
          onClick={handleSave}
          // Кнопка неактивна пока идет загрузка данных ИЛИ сохранение
          disabled={isLoading || isSaving} 
          className="shrink-0"
          size="sm"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </div>

      {/* CONTENT CARD */}
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
          
          {isLoading ? (
             /* SKELETON CONTENT */
             <>
               {/* Email Toggle Skeleton */}
               <div className="flex items-center justify-between py-4 pt-0">
                  <div className="flex items-center gap-3">
                     <Skeleton className="h-10 w-10 rounded-lg" />
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                     </div>
                  </div>
                  <Skeleton className="h-6 w-10 rounded-full" />
               </div>

               {/* Quiet Mode Skeleton */}
               <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-40" />
                           <Skeleton className="h-3 w-48" />
                        </div>
                     </div>
                     <Skeleton className="h-6 w-10 rounded-full" />
                  </div>
                  
                  {/* Inputs Skeleton */}
                  <div className="pl-14 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Skeleton className="h-3 w-16" />
                           <Skeleton className="h-9 w-full rounded-md" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-3 w-16" />
                           <Skeleton className="h-9 w-full rounded-md" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <div className="flex gap-2">
                           {Array.from({ length: 7 }).map((_, i) => (
                              <Skeleton key={i} className="h-9 w-9 rounded-full" />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
             </>
          ) : settings ? (
             /* REAL FORM CONTENT */
             <>
                {/* Email Notification */}
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

                {/* Quiet Mode */}
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
                                    ? "bg-primary text-primary-foreground border-primary"
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
             </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}