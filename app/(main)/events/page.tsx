"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  FileText,
  User
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
  DropdownMenuSeparator
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
import { STATUS_MAP, RequestStatus } from "@/lib/types";

const EVENTS = [
  { id: "evt_1", type: "Падение пациента", category: "Безопасность", date: "24.11.2025", status: "in_work", author: "Иванов И.И." },
  { id: "evt_2", type: "Ошибка в дозировке", category: "Лекарства", date: "23.11.2025", status: "created", author: "Сидорова А.А." },
  { id: "evt_3", type: "Сбой инфузомата", category: "Оборудование", date: "22.11.2025", status: "completed", author: "Петров П.П." },
  { id: "evt_4", type: "Утеря анализов", category: "Документация", date: "22.11.2025", status: "refused", author: "Иванов И.И." },
  { id: "evt_5", type: "Падение посетителя", category: "Безопасность", date: "21.11.2025", status: "completed", author: "Охрана" },
] as const;

export default function EventsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEvents = EVENTS.filter((event) => {
    const matchesSearch = event.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = (id: string) => {
    if (confirm(`Вы уверены, что хотите отменить событие ${id}?`)) {
      console.log(`Событие ${id} отменено`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Журнал событий</h1>
          <p className="text-sm text-muted-foreground">Список всех зарегистрированных инцидентов</p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Новое событие
          </Button>
        </Link>
      </div>

      {/* Панель фильтров */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или ID..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Статус" />
            </div>
          </SelectTrigger>
          <SelectContent className="border">
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(STATUS_MAP).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ТАБЛИЦА (ПК) */}
      <div className="hidden md:block bg-card rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Тип события</TableHead>
              <TableHead className="text-muted-foreground">Категория</TableHead>
              <TableHead className="text-muted-foreground">Автор</TableHead>
              <TableHead className="text-muted-foreground">Статус</TableHead>
              <TableHead className="text-center text-muted-foreground">Дата</TableHead>
              <TableHead className="text-right text-muted-foreground">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="border-b hover:bg-muted/50">
                  <TableCell className="font-medium text-xs text-muted-foreground">{event.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{event.type}</TableCell>
                  <TableCell className="text-muted-foreground">{event.category}</TableCell>
                  <TableCell className="text-muted-foreground">{event.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(event.status)}`}>
                      {STATUS_MAP[event.status as RequestStatus] || event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border w-48">
                        <Link href={`/events/${event.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Просмотреть
                            </DropdownMenuItem>
                        </Link>
                        <Link href={`/events/${event.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleCancel(event.id)}
                        >
                             <Trash2 className="mr-2 h-4 w-4" />
                             Отменить
                        </DropdownMenuItem>
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

      {/* КАРТОЧКИ (Мобильные) */}
      <div className="md:hidden space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
                <Link href={`/events/${event.id}`} className="block">
                    <Card className={`
                        relative overflow-hidden transition-all active:scale-[0.99] border p-0 gap-0 bg-card
                        ${event.status === 'in_work' ? 'border-l-warning border-l-4' : ''}
                        ${event.status === 'created' ? 'border-l-muted-foreground border-l-4' : ''}
                        ${event.status === 'completed' ? 'border-l-success border-l-4' : ''}
                        ${event.status === 'refused' ? 'border-l-destructive border-l-4' : ''}
                    `}>
                        {/* ВЕРХНЯЯ ЧАСТЬ: Отступ справа под кнопку меню */}
                        <div className="pt-3 px-3 pr-10 pb-2"> 
                            <div className="mb-2">
                                <h3 className="font-semibold text-foreground text-sm leading-tight pt-0.5">
                                    {event.type}
                                </h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className={`
                                    text-[10px] h-5 px-1.5 whitespace-nowrap shrink-0 border
                                    ${getStatusColor(event.status)}
                                `}>
                                    {STATUS_MAP[event.status as RequestStatus] || event.status}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm border">
                                    {event.category}
                                </span>
                            </div>

                            <div className="mb-1 space-y-1.5">
                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <User className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{event.author}</span>
                                </div>
                            </div>
                        </div>

                        {/* НИЖНЯЯ ЧАСТЬ (ФУТЕР): На всю ширину */}
                        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/5 mt-1">
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
                    </Card>
                </Link>

                {/* Выпадающее меню */}
                <div className="absolute top-1 right-1 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                             <Link href={`/events/${event.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Просмотреть
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`/events/${event.id}/edit`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Редактировать
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel(event.id);
                                }}
                            >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Отменить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          ))
        ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-card rounded-lg border border-dashed">
                <Search className="h-8 w-8 mb-2 opacity-20" />
                <span className="text-sm">Ничего не найдено</span>
            </div>
        )}
      </div>
    </div>
  );
}