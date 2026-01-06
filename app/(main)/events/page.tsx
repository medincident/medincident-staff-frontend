"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getStatusColor } from "@/lib/status-helper";

// Мок-данные
const EVENTS = [
  { id: "evt_1", type: "Падение пациента", category: "Безопасность", date: "24.11.2025", status: "В работе", author: "Иванов И.И." },
  { id: "evt_2", type: "Ошибка в дозировке", category: "Лекарства", date: "23.11.2025", status: "Зарегистрировано", author: "Сидорова А.А." },
  { id: "evt_3", type: "Сбой инфузомата", category: "Оборудование", date: "22.11.2025", status: "Выполнено", author: "Петров П.П." },
  { id: "evt_4", type: "Утеря анализов", category: "Документация", date: "22.11.2025", status: "Отказано", author: "Иванов И.И." },
  { id: "evt_5", type: "Падение посетителя", category: "Безопасность", date: "21.11.2025", status: "Выполнено", author: "Охрана" },
];

export default function EventsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEvents = EVENTS.filter((event) => {
    const matchesSearch = event.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Журнал событий</h1>
          <p className="text-sm text-muted-foreground">Список всех зарегистрированных инцидентов</p>
        </div>
        <Link href="/events/new">
          {/* Кнопка использует primary цвет (автоматически зеленый) */}
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Новое событие
          </Button>
        </Link>
      </div>

      {/* Панель фильтров */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          {/* ИСПРАВЛЕНО: bg-background вместо bg-white */}
          <Input
            placeholder="Поиск по названию или ID..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          {/* ИСПРАВЛЕНО: bg-background */}
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Статус" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="Зарегистрировано">Зарегистрировано</SelectItem>
            <SelectItem value="В работе">В работе</SelectItem>
            <SelectItem value="Выполнено">Выполнено</SelectItem>
            <SelectItem value="Отказано">Отказано</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ВАРИАНТ 1: ТАБЛИЦА (ПК) */}
      {/* ИСПРАВЛЕНО: bg-card border-border */}
      <div className="hidden md:block bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Тип события</TableHead>
              <TableHead className="text-muted-foreground">Категория</TableHead>
              <TableHead className="text-muted-foreground">Автор</TableHead>
              <TableHead className="text-center text-muted-foreground">Дата</TableHead>
              <TableHead className="text-muted-foreground">Статус</TableHead>
              <TableHead className="text-right text-muted-foreground">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="border-b border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-xs text-muted-foreground">{event.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{event.type}</TableCell>
                  <TableCell className="text-muted-foreground">{event.category}</TableCell>
                  <TableCell className="text-muted-foreground">{event.author}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/events/${event.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                                Просмотреть детали
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>Скачать отчет</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  События не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ВАРИАНТ 2: КАРТОЧКИ (Мобильные) */}
      <div className="md:hidden space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id} className="block group">
                <Card className={`
                  relative overflow-hidden transition-all active:scale-[0.99] border shadow-sm p-0 bg-card
                  ${event.status === 'В работе' ? 'border-l-warning border-l-4' : ''}
                  ${event.status === 'Зарегистрировано' ? 'border-l-muted-foreground border-l-4' : ''}
                  ${event.status === 'Выполнено' ? 'border-l-success border-l-4' : ''}
                  ${event.status === 'Отказано' ? 'border-l-destructive border-l-4' : ''}
                `}>
                    <div className="px-3 py-2 sm:p-4">
                        <div className="flex justify-between items-start mb-0.5 gap-2">
                            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 pt-0.5">
                                {event.type}
                            </h3>
                            <Badge variant="outline" className={`
                              text-[10px] h-5 px-1.5 whitespace-nowrap shrink-0
                              ${getStatusColor(event.status)}
                            `}>
                                {event.status}
                            </Badge>
                        </div>

                        <div className="mb-1.5">
                           <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                             {event.category}
                           </span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-border mt-1.5">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                                <span className="flex items-center gap-1">
                                  <span className="font-bold text-muted-foreground">#{event.id.split('_')[1]}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {event.date}
                                </span>
                            </div>
                            <div className="text-muted-foreground/50">
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
          ))
        ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-card rounded-lg border border-dashed border-border">
                <Search className="h-8 w-8 mb-2 opacity-20" />
                <span className="text-sm">Ничего не найдено</span>
            </div>
        )}
      </div>
    </div>
  );
}