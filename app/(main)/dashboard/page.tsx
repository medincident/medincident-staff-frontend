"use client";

import Link from "next/link";
import { 
  Plus, 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "./trend-chart";
import { getStatusColor } from "@/lib/status-helper";

const STATS = {
  total: 12,
  inWork: 3,
  completed: 8,
};

const RECENT_EVENTS = [
  { 
    id: "evt_1", 
    type: "Падение пациента", 
    date: "10:30, Сегодня", 
    status: "Зарегистрировано", 
    description: "Падение в коридоре 2 этажа возле процедурного кабинета." 
  },
  { 
    id: "evt_2", 
    type: "Ошибка идентификации", 
    date: "14:15, Вчера", 
    status: "В работе", 
    description: "Перепутали однофамильцев при выдаче лекарств." 
  },
  { 
    id: "evt_3", 
    type: "Поломка оборудования", 
    date: "09:00, 20.11", 
    status: "Выполнено", 
    description: "Инфузомат не включался, передано техникам." 
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-foreground">Панель управления</h2>
        <p className="text-muted-foreground">Добро пожаловать в систему мониторинга НС</p>
      </div>

      {/* СЕТКА */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Блок действий и статистики */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Кнопка действия */}
            <Link href="/events/new" className="block col-span-1 sm:col-span-2">
              {/* Используем просто bg-primary - он сам станет зеленым или синим в зависимости от темы */}
              <Button className="w-full h-auto py-6 text-lg shadow-md flex flex-col gap-1 items-center justify-center transition-transform active:scale-[0.99]">
                <div className="flex items-center gap-2">
                    <Plus className="h-6 w-6" />
                    <span>Зарегистрировать новое событие</span>
                </div>
                <span className="text-xs font-normal opacity-80 hidden sm:inline">Нажмите для открытия формы регистрации</span>
              </Button>
            </Link>

            {/* Карточка: Всего */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Всего за месяц</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{STATS.total}</div>
                </CardContent>
            </Card>
            
            {/* Карточка: В работе */}
            <Card className="shadow-sm bg-warning/5 border-warning/20">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-warning/80">В работе</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-warning">{STATS.inWork}</div>
                </CardContent>
            </Card>
          </section>

          {/* График */}
          <Card className="hidden md:block shadow-sm">
            <CardHeader>
                <CardTitle>Динамика событий</CardTitle>
                <CardDescription>Количество инцидентов за последние 7 дней</CardDescription>
            </CardHeader>
            <CardContent className="pl-0 pb-4">
                <TrendChart />
            </CardContent>
          </Card>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Последние события</h3>
            <Link href="/events" className="text-sm text-primary hover:underline">Все</Link>
          </div>
          
          <div className="space-y-3">
             {RECENT_EVENTS.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block group">
                  {/* Карточки списка */}
                  <Card className="transition-all hover:border-primary/50 hover:shadow-md flex flex-col gap-1 p-1">
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                      <Badge variant="outline" className={`
                        text-[12px] h-5 px-1.5 whitespace-nowrap shrink-0
                        ${getStatusColor(event.status)}
                      `}>
                          {event.status}
                      </Badge>
                      <span className="text-[12px] text-muted-foreground font-mono">{event.date.split(',')[0]}</span>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-1">{event.type}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}