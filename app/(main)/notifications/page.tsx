"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Info, 
  AlertTriangle, 
  Bell,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Мок-данные уведомлений
const NOTIFICATIONS = [
  { id: 1, title: "Новое событие", desc: "Назначено ответственное лицо: Петрова А.В.", time: "10:30", date: "Сегодня", type: "info" },
  { id: 2, title: "Сбой системы", desc: "Не удалось отправить отчет на сервер Минздрава", time: "09:15", date: "Сегодня", type: "error" },
  { id: 3, title: "Статус обновлен", desc: "Событие #123 переведено в статус 'Выполнено'", time: "Вчера", date: "Вчера", type: "success" },
  { id: 4, title: "Ежемесячный отчет", desc: "Отчет за Октябрь готов к скачиванию", time: "24.11", date: "Ранее", type: "info" },
  { id: 5, title: "Новый сотрудник", desc: "Регистрация пользователя @ivanov_tg", time: "20.11", date: "Ранее", type: "info" },
];

export default function NotificationsPage() {
  const router = useRouter();

  // Иконки для разных типов
  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-destructive-foreground" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-success-foreground" />;
      default: return <Info className="h-5 w-5 text-primary-foreground" />; // info uses primary color text
    }
  };

  // Цвета фона иконки (семантические)
  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-destructive';
      case 'success': return 'bg-success';
      default: return 'bg-primary';
    }
  };

  // Группируем по дате
  const grouped = NOTIFICATIONS.reduce((acc, note) => {
    if (!acc[note.date]) acc[note.date] = [];
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, typeof NOTIFICATIONS>);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Шапка */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
          <p className="text-sm text-muted-foreground">История системных сообщений</p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-1">
              {date}
            </h3>
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {items.map((note) => (
                    <div key={note.id} className="flex gap-4 p-4 hover:bg-muted/50 transition-colors">
                      {/* Иконка с семантическим фоном */}
                      <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getIconBgColor(note.type)}`}>
                        {getIcon(note.type)}
                      </div>
                      
                      {/* Текст */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-foreground text-sm">
                            {note.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {note.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {note.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Заглушка если пусто */}
      {NOTIFICATIONS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Нет уведомлений</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                  Мы сообщим вам, когда произойдет что-то важное.
              </p>
          </div>
      )}
    </div>
  );
}