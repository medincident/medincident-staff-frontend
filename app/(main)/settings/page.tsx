"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Bell, Globe, Clock, Smartphone, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const [notifications, setNotifications] = useState({
    telegram: true,
    email: false,
    push: true
  });

  const handleSave = () => {
    setLoading(true);
    // Имитация запроса на сервер
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
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Общие настройки</h1>
          <p className="text-sm text-muted-foreground">Параметры локализации и уведомлений</p>
        </div>
      </div>

      {/* 1. Локализация */}
      <Card className="bg-card border-border">
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                Язык и Регион
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label className="text-foreground">Язык интерфейса</Label>
                <Select defaultValue="ru">
                    <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Выберите язык" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="kz">Қазақша</SelectItem>
                    </SelectContent>
                </Select>
            </div>
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

      {/* 2. Уведомления */}
      <Card className="bg-card border-border">
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Bell className="h-4 w-4 text-warning" />
                Уведомления
            </CardTitle>
            <CardDescription className="text-muted-foreground">Куда отправлять оповещения о новых НС</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
            {/* Telegram */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                        <Label className="text-base text-foreground">Telegram</Label>
                        <p className="text-xs text-muted-foreground">Мгновенные сообщения боту</p>
                    </div>
                </div>
                <Switch 
                    checked={notifications.telegram}
                    onCheckedChange={(v) => setNotifications({...notifications, telegram: v})}
                />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full text-muted-foreground">
                        <Mail className="h-4 w-4" />
                    </div>
                    <div>
                        <Label className="text-base text-foreground">Email</Label>
                        <p className="text-xs text-muted-foreground">Сводка на почту</p>
                    </div>
                </div>
                <Switch 
                    checked={notifications.email}
                    onCheckedChange={(v) => setNotifications({...notifications, email: v})}
                />
            </div>
        </CardContent>
      </Card>

      {/* Кнопка сохранения */}
      <div className="flex justify-end pt-4">
        <Button 
            onClick={handleSave} 
            disabled={loading} 
            // Используем стандартный variant="default" (зеленый)
            className="w-full sm:w-auto shadow-sm"
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