"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Bell, 
  Clock, 
  Mail, 
  Moon,
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Состояние настроек
  const [settings, setSettings] = useState({
    emailNotification: false,
    quietMode: {
      enabled: false,
      from: "22:00",
      to: "07:00"
    }
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Настройки успешно сохранены!");
      router.back();
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Шапка */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Общие настройки</h1>
          <p className="text-sm text-muted-foreground">Время и режим уведомлений</p>
        </div>
      </div>

      {/* 1. Региональные настройки */}
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
                <Select defaultValue="msk">
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

      {/* 2. Уведомления и Тихие часы */}
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
            
            {/* Email */}
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

            {/* Тихие часы */}
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

      {/* Кнопка сохранения */}
      <div className="flex justify-end pt-4">
        <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full sm:w-auto"
        >
            {loading ? "Сохранение..." : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить изменения
                </>
            )}
        </Button>
      </div>
    </div>
  );
}