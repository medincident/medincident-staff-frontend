"use client";

import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  UserPlus,
  Clock,
  BellOff
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Моки
const NOTIFICATIONS = [
  { id: 1, title: "Новое событие", desc: "Назначено ответственное лицо: Петрова А.В.", time: "10:30", date: "Сегодня", type: "info", icon: Info },
  { id: 2, title: "Сбой отправки", desc: "Не удалось отправить отчет на сервер Минздрава. Повторная попытка через 15 мин.", time: "09:15", date: "Сегодня", type: "error", icon: AlertCircle },
  { id: 3, title: "Задача выполнена", desc: "Событие #123 переведено в статус 'Выполнено'", time: "16:45", date: "Вчера", type: "success", icon: CheckCircle2 },
  { id: 4, title: "Ежемесячный отчет", desc: "Сводный отчет за Октябрь сформирован и доступен для скачивания.", time: "10:00", date: "Вчера", type: "file", icon: FileText },
  { id: 5, title: "Новый сотрудник", desc: "Регистрация пользователя @ivanov_tg в системе.", time: "20.11", date: "Ранее", type: "user", icon: UserPlus },
];

export default function NotificationsPage() {
  const router = useRouter();

  const grouped = NOTIFICATIONS.reduce((acc, note) => {
    if (!acc[note.date]) acc[note.date] = [];
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, typeof NOTIFICATIONS>);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* Шапка */}
      <div className="flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 border-b md:static md:border-none md:bg-transparent md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
          <p className="text-sm text-muted-foreground">История системных сообщений</p>
        </div>
      </div>

      <div className="space-y-8 px-4 md:px-0">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="relative">
            
            {/* Заголовок даты */}
            <div className="sticky top-20 md:top-0 z-0 flex items-center mb-4">
               <Badge variant="outline" className="bg-background text-muted-foreground font-normal px-3 py-1 border-border">
                 {date}
               </Badge>
               <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
            </div>

            {/* Список уведомлений */}
            <div className="space-y-4 ml-2">
              {items.map((note) => {
                const Icon = note.icon;
                
                // Используем семантические цвета с прозрачностью (/10 для фона, /20 для рамки)
                // Это позволяет цветам выглядеть хорошо и в темной, и в светлой теме
                const typeStyles = {
                   error:   "text-destructive bg-destructive/10 border-destructive/20",
                   success: "text-success bg-success/10 border-success/20",
                   info:    "text-info bg-info/10 border-info/20",
                   file:    "text-purple bg-purple/10 border-purple/20",
                   user:    "text-warning bg-warning/10 border-warning/20", // UserPlus используем warning (оранжевый)
                }[note.type] || "text-muted-foreground bg-muted border-border";

                return (
                  <div key={note.id} className="relative group pl-6 md:pl-0">
                    
                    {/* Линия таймлайна */}
                    <div className="absolute left-0 top-3 bottom-[-20px] w-px bg-border md:hidden last:hidden"></div>

                    <div className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200",
                        "hover:border-primary/30 hover:shadow-sm",
                        // Для ошибок делаем саму карточку чуть красноватой
                        note.type === 'error' ? "border-destructive/30 bg-destructive/5" : "border-border"
                    )}>
                      
                      {/* Иконка с цветной подложкой */}
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 border", typeStyles)}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={cn("text-sm font-semibold truncate", note.type === 'error' ? 'text-destructive' : 'text-foreground')}>
                            {note.title}
                          </h4>
                          <span className="flex items-center text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1 opacity-70" />
                            {note.time}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {note.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {NOTIFICATIONS.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <BellOff className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Здесь пока тихо</h3>
            <p className="text-muted-foreground mt-2 max-w-xs">
                Новые уведомления о событиях и заявках появятся здесь.
            </p>
        </div>
      )}
    </div>
  );
}