"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Bell, 
  Clock, 
  Mail, 
  Moon,
  Globe,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [settings, setSettings] = useState({
    timezone: "msk",
    emailNotification: false,
    quietMode: {
      enabled: false,
      from: "22:00",
      to: "07:00"
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Ошибка", "Не удалось загрузить настройки");
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

      toast.success("Успешно", "Настройки сохранены!");
      router.back();
    } catch (error) {
        toast.error("Ошибка", "Не удалось сохранить настройки");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
             <Skeleton className="h-8 w-48" />
             <Skeleton className="h-4 w-64" />
          </div>
        </div>
  
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
           <div className="p-6 pb-4">
              <div className="flex items-center gap-3">
                 <Skeleton className="h-10 w-10 rounded-lg" />
                 <Skeleton className="h-6 w-48" />
              </div>
           </div>
           <div className="p-6 pt-0 space-y-4">
              <div className="space-y-2">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-3 w-64" />
              </div>
           </div>
        </div>
  
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
           <div className="p-6 pb-4">
              <div className="flex items-center gap-3">
                 <Skeleton className="h-10 w-10 rounded-lg" />
                 <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48" />
                 </div>
              </div>
           </div>
           <div className="p-6 pt-0 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                       <Skeleton className="h-5 w-32" />
                       <Skeleton className="h-3 w-40" />
                    </div>
                 </div>
                 <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                       <Skeleton className="h-5 w-40" />
                       <Skeleton className="h-3 w-48" />
                    </div>
                 </div>
                 <Skeleton className="h-6 w-12 rounded-full" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Общие настройки</h1>
          <p className="text-sm text-muted-foreground">Время и режим уведомлений</p>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-3 text-foreground">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                    <Globe className="h-5 w-5" />
                </div>
                Региональные настройки
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label className="text-foreground">Часовой пояс</Label>
                <Select 
                    value={settings.timezone} 
                    onValueChange={(val) => setSettings({...settings, timezone: val})}
                >
                    <SelectTrigger className="bg-background border-input">
                          <div className="flex items-center gap-2 text-foreground">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Выберите пояс" />
                          </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="kal">Калининград (UTC+2)</SelectItem>
                        <SelectItem value="msk">Москва (UTC+3)</SelectItem>
                        <SelectItem value="ekb">Екатеринбург (UTC+5)</SelectItem>
                        <SelectItem value="oms">Омск (UTC+6)</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Время в отчетах будет отображаться согласно этой настройке.</p>
            </div>
        </CardContent>
      </Card>

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
                    onCheckedChange={(v) => setSettings({...settings, emailNotification: v})}
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
                        onCheckedChange={(v) => setSettings({...settings, quietMode: {...settings.quietMode, enabled: v}})}
                    />
                </div>

                {settings.quietMode.enabled && (
                    <div className="grid grid-cols-2 gap-4 pl-14 animate-in fade-in slide-in-from-top-1">
                        <div className="grid gap-1.5">
                            <Label className="text-xs text-muted-foreground">С (время)</Label>
                            <Input 
                                type="time" 
                                className="bg-background border-input"
                                value={settings.quietMode.from}
                                onChange={(e) => setSettings({...settings, quietMode: {...settings.quietMode, from: e.target.value}})}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-xs text-muted-foreground">До (время)</Label>
                            <Input 
                                type="time" 
                                className="bg-background border-input" 
                                value={settings.quietMode.to}
                                onChange={(e) => setSettings({...settings, quietMode: {...settings.quietMode, to: e.target.value}})}
                            />
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
    </div>
  );
}