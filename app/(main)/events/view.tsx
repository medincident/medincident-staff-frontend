"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Edit,
  User,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { EVENT_STATUS_MAP } from "@/lib/constants";
import { getBadgeColor, getCardBorderColor } from "@/lib/status-helper";
import { EventStatus, IncidentEvent, Category } from "@/lib/types";

// Импортируем моки напрямую вместо старых сервисов
import { eventsDb, CLASSIFIER_DB } from "@/lib/mock-db";

export function EventsListView() {
  // --- STATE ---
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [classifier, setClassifier] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 1. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Имитируем небольшую сетевую задержку для реалистичности UI
        await new Promise(resolve => setTimeout(resolve, 600));

        // Берем данные из наших моков
        setEvents(eventsDb);
        setClassifier(CLASSIFIER_DB);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. ПОДГОТОВКА ДАННЫХ
  const { typeNamesMap, categoryNamesMap } = useMemo(() => {
    const types: Record<string, string> = {};
    const cats: Record<string, string> = {};
    
    classifier.forEach((cat) => {
      cats[cat.id] = cat.name;
      cat.types.forEach((t) => {
        types[t.id] = t.name;
      });
    });
    return { typeNamesMap: types, categoryNamesMap: cats };
  }, [classifier]);

  // 3. ФИЛЬТРАЦИЯ
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const typeNameRu = typeNamesMap[event.typeId || ""] || event.typeName || "";
      const categoryNameRu = categoryNamesMap[event.categoryId] || event.categoryName || "";

      const searchString = `${event.code} ${typeNameRu} ${categoryNameRu} ${event.description || ""}`.toLowerCase();
      const matchesSearch = searchString.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter, typeNamesMap, categoryNamesMap]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Журнал событий</h1>
          <p className="text-sm text-muted-foreground">
            Список всех зарегистрированных инцидентов и НС
          </p>
        </div>
        <Link href="/events/new">
          <Button className="font-semibold" disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Новое событие
          </Button>
        </Link>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-full sm:flex-1 rounded-md" />
            <Skeleton className="h-9 w-full sm:w-[220px] rounded-md" />
          </>
        ) : (
          <>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по коду, типу или описанию..."
                className="pl-9 bg-background focus-visible:ring-primary w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[220px] bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </div>
              </SelectTrigger>
              <SelectContent className="border">
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(EVENT_STATUS_MAP).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* TABLE (DESKTOP) */}
      <div className="hidden xl:block bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px] text-muted-foreground font-semibold">Код</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Событие</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Категория</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Статус</TableHead>
              <TableHead className="text-center text-muted-foreground font-semibold">Дата</TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <TableRow key={`skel-row-${i}`} className="border-b">
                   <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                   <TableCell>
                     <div className="space-y-1">
                       <Skeleton className="h-4 w-48" />
                       <Skeleton className="h-3 w-32" />
                     </div>
                   </TableCell>
                   <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                   <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                   <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                 </TableRow>
               ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/events/${event.id}`}
                >
                  <TableCell className="font-mono font-bold text-xs text-muted-foreground">
                    {event.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-87.5">
                      <span className="font-semibold text-foreground truncate">
                        {typeNamesMap[event.typeId || ""] || event.typeName || event.typeId}
                      </span>
                      <span className="truncate text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
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
                    <Link href={`/events/${event.id}/edit`}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    События не найдены
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* CARDS (MOBILE) */}
      <div className="xl:hidden space-y-4">
        {isLoading ? (
           /* MOB SKELETONS: MATCHING CARD STRUCTURE */
           Array.from({ length: 3 }).map((_, i) => (
             <div key={`mob-skel-${i}`} className="border rounded-xl bg-card overflow-hidden relative">
               <div className="p-4 pr-12 pb-3 space-y-3">
                 <div className="space-y-1.5">
                   <Skeleton className="h-3 w-16" /> {/* Code */}
                   <Skeleton className="h-5 w-3/4" /> {/* Title */}
                 </div>
                 <div className="flex gap-2">
                   <Skeleton className="h-5 w-20 rounded-full" /> {/* Status */}
                   <Skeleton className="h-5 w-24 rounded-full" /> {/* Category */}
                 </div>
                 <div className="flex items-center gap-2">
                   <Skeleton className="h-3.5 w-3.5 rounded-full" />
                   <Skeleton className="h-3 w-24" /> {/* Author */}
                 </div>
               </div>
               <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/5">
                 <div className="flex gap-2">
                   <Skeleton className="h-3 w-3" />
                   <Skeleton className="h-3 w-20" /> {/* Date */}
                 </div>
                 <Skeleton className="h-4 w-4 rounded-full opacity-20" /> {/* Chevron */}
               </div>
               <div className="absolute top-3 right-3">
                 <Skeleton className="h-8 w-8 rounded-md" /> {/* Edit button */}
               </div>
             </div>
           ))
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="relative">
              <Link href={`/events/${event.id}`} className="block">
                <Card className={`relative overflow-hidden transition-all active:scale-[0.98] border p-0 gap-0 bg-card ${getCardBorderColor(event.status)}`}>
                  <div className="p-4 pr-12 pb-3">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                          {event.code}
                        </span>
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
                        {categoryNamesMap[event.categoryId] || event.categoryName || event.categoryId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{event.author || "Неизвестный"}</span>
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

              <div className="absolute top-3 right-3">
                <Link href={`/events/${event.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
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