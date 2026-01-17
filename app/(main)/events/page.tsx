"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Edit,
  Trash2,
  User,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

import { IncidentEvent, EventStatus, Category } from "@/lib/types";
import { EVENT_STATUS_MAP } from "@/lib/constants";
import { getBadgeColor, getCardBorderColor } from "@/lib/status-helper";

export default function EventsListPage() {
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [classifier, setClassifier] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Загружаем публичный классификатор
        const [eventsRes, classifierRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/classifier")
        ]);

        if (eventsRes.ok && classifierRes.ok) {
          const eventsData = await eventsRes.json();
          const classifierData = await classifierRes.json();

          setEvents(eventsData);
          setClassifier(classifierData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 1. Словарь типов событий (id -> name)
  const typeNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    classifier.forEach(cat => {
      cat.types.forEach(t => {
        map[t.id] = t.name;
      });
    });
    return map;
  }, [classifier]);

  // 2. Словарь категорий (id -> name) — ДОБАВЛЕНО
  const categoryNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    classifier.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [classifier]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const typeNameRu = typeNamesMap[event.typeId || ""] || event.typeName || "";
      // Можно добавить поиск и по названию категории
      const categoryNameRu = categoryNamesMap[event.categoryId] || event.categoryName || "";

      const searchString = `${event.code} ${typeNameRu} ${categoryNameRu} ${event.description || ''}`.toLowerCase();
      const termLower = searchTerm.toLowerCase();

      const matchesSearch = searchString.includes(termLower);
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter, typeNamesMap, categoryNamesMap]);

  const handleCancel = (id: string) => {
    if (confirm(`Вы уверены, что хотите закрыть это событие?`)) {
      console.log(`Event ${id} closed`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
        </div>
        <div className="hidden md:block rounded-md border overflow-hidden">
          <div className="border-b bg-muted/50 p-4 flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-4 flex-1" />)}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b flex gap-4 items-center last:border-0">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Журнал событий</h1>
          <p className="text-sm text-muted-foreground">Список всех зарегистрированных инцидентов и НС</p>
        </div>
        <Link href="/events/new">
          <Button className="font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Новое событие
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по коду, типу или описанию..."
            className="pl-9 bg-background focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Статус" />
            </div>
          </SelectTrigger>
          <SelectContent className="border">
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(EVENT_STATUS_MAP).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ТАБЛИЦА (DESKTOP) */}
      <div className="hidden md:block bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px] text-muted-foreground font-semibold">Код</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Событие</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Категория</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Статус</TableHead>
              <TableHead className="text-center text-muted-foreground font-semibold">Дата</TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/events/${event.id}`}
                >
                  <TableCell className="font-mono font-bold text-xs text-muted-foreground">
                    {event.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[350px]">
                      <span className="font-semibold text-foreground truncate">
                        {typeNamesMap[event.typeId || ""] || event.typeName || event.typeId}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {/* 3. ИСПОЛЬЗУЕМ СЛОВАРЬ КАТЕГОРИЙ */}
                    {categoryNamesMap[event.categoryId] || event.categoryName || event.categoryId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`whitespace-nowrap font-medium ${getBadgeColor(event.status)}`}>
                      {EVENT_STATUS_MAP[event.status as EventStatus] || event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs whitespace-nowrap">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border w-48">
                        <Link href={`/events/${event.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Редактировать
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleCancel(event.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Закрыть
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  События не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* КАРТОЧКИ (MOBILE) */}
      <div className="md:hidden space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="relative">
              <Link href={`/events/${event.id}`} className="block">
                <Card className={`
                        relative overflow-hidden transition-all active:scale-[0.98] border p-0 gap-0 bg-card
                        ${getCardBorderColor(event.status)}
                    `}>
                  <div className="p-4 pr-12 pb-3">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{event.code}</span>
                      </div>
                      <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-1">
                        {typeNamesMap[event.typeId || ""] || event.typeName || event.typeId}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium ${getBadgeColor(event.status)}`}>
                        {EVENT_STATUS_MAP[event.status as EventStatus] || event.status}
                      </Badge>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border">
                        {/* 4. И ЗДЕСЬ ТОЖЕ СЛОВАРЬ КАТЕГОРИЙ */}
                        {categoryNamesMap[event.categoryId] || event.categoryName || event.categoryId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{event.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/5 mt-1">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                </Card>
              </Link>

              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:bg-muted"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border w-48">
                    <Link href={`/events/${event.id}/edit`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Редактировать
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
                      <Trash2 className="mr-2 h-4 w-4" /> Закрыть
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card rounded-2xl border border-dashed">
            <Search className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">События не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}