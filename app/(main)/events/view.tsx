"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
import { PermissionGate } from "@/components/auth/permission-gate";

import { EVENT_STATUS_MAP, INCIDENT_PRIORITY_MAP } from "@/lib/constants";
import { getBadgeColor, getCardBorderColor } from "@/lib/status-helper";
import { EventStatus } from "@/lib/types";

import {
  IncidentQueryService,
  v1IncidentView,
} from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { usePermissions } from "@/lib/auth/use-permissions";
import { useIncidentClassifier } from "@/lib/classifiers/incident-classifier-store";

// Бейдж приоритета НС. unspecified/пусто → приглушённый прочерк, чтобы
// колонка/ряд не «прыгали».
function PriorityBadge({ priority }: { priority?: string }) {
  const key = (priority || "").toLowerCase().replace("incident_priority_", "");
  if (!key || key === "unspecified") {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }
  return (
    <Badge
      variant="outline"
      className={`whitespace-nowrap text-[10px] h-5 px-2 font-medium ${getBadgeColor(key)}`}
    >
      {INCIDENT_PRIORITY_MAP[key] || key}
    </Badge>
  );
}

export function EventsListView() {
  const { data: session } = useSession();
  const { orgId: activeOrgId, isResolving: isOrgResolving } = useActiveOrgId();
  const perms = usePermissions();
  const [events, setEvents] = useState<v1IncidentView[]>([]);
  // Категории/типы НС — из общего zustand-кеша (см. incident-classifier-store).
  const { categories, types } = useIncidentClassifier(activeOrgId);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    // Ждём perms.isLoading — главврач с пустыми флагами попал бы в «вижу только своё».
    if (isOrgResolving || perms.isLoading) return;
    if (!userId) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const orgId = activeOrgId ?? "";

        // Фильтр на бэк, иначе при пагинации часть событий уйдёт за окно.
        const statusesParam =
          statusFilter !== "all"
            ? [`INCIDENT_STATUS_${statusFilter.toUpperCase()}`]
            : undefined;

        // У ListMyIncidents серверного фильтра нет, статус доберём в filteredEvents.
        let incidentsRes;
        if (perms.canSeeAllIncidents && orgId) {
          incidentsRes = await IncidentQueryService.incidentQueryListIncidents(
            orgId,
            statusesParam,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            100,
          );
        } else {
          incidentsRes = await IncidentQueryService.incidentQueryListMyIncidents(100);
        }

        if (incidentsRes && "items" in incidentsRes && incidentsRes.items) {
          setEvents(incidentsRes.items);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, activeOrgId, isOrgResolving, perms.isLoading, perms.canSeeAllIncidents, statusFilter]);

  const { typeNamesMap, categoryNamesMap } = useMemo(() => {
    const typeMap: Record<string, string> = {};
    const catMap: Record<string, string> = {};
    
    categories.forEach((cat) => {
      if (cat.id && cat.name) catMap[cat.id] = cat.name;
    });
    
    types.forEach((t) => {
      if (t.id && t.name) typeMap[t.id] = t.name;
    });
    
    return { typeNamesMap: typeMap, categoryNamesMap: catMap };
  }, [categories, types]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const typeNameRu = typeNamesMap[event.typeId || ""] || event.typeId || "";
      const categoryNameRu = categoryNamesMap[event.categoryId || ""] || event.categoryId || "";

      const shortId = event.id ? event.id.substring(0, 8) : "";

      const searchString = `${shortId} ${typeNameRu} ${categoryNameRu} ${event.description || ""}`.toLowerCase();
      const matchesSearch = searchString.includes(searchQuery.toLowerCase());

      // Для админов фильтр уже на бэке; клиент добивает только ListMyIncidents.
      const evtStatus = (event.status || "").toLowerCase().replace("incident_status_", "");
      const matchesStatus =
        statusFilter === "all" || perms.canSeeAllIncidents
          ? true
          : evtStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter, typeNamesMap, categoryNamesMap, perms.canSeeAllIncidents]);

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
        <PermissionGate can="canCreateIncident">
          <Link href="/events/new">
            <Button className="font-semibold" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Новое событие
            </Button>
          </Link>
        </PermissionGate>
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
      <div className="hidden 2xl:block bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px] text-muted-foreground font-semibold">Код</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Событие</TableHead>
              <TableHead className="text-muted-foreground font-semibold max-w-[280px]">Категория</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Статус</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Приоритет</TableHead>
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
                   <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                   <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                 </TableRow>
               ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const evtStatusStr = (event.status || "").toLowerCase().replace("incident_status_", "");
                
                return (
                  <TableRow
                    key={event.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = `/events/${event.id}`}
                  >
                    <TableCell className="font-mono font-bold text-xs text-muted-foreground">
                      {event.id?.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-87.5">
                        <span className="font-semibold text-foreground truncate">
                          {typeNamesMap[event.typeId || ""] || event.typeId}
                        </span>
                        <span className="truncate text-xs text-muted-foreground line-clamp-1">
                          {event.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div
                        className="max-w-[280px] truncate"
                        title={categoryNamesMap[event.categoryId || ""] || event.categoryId}
                      >
                        {categoryNamesMap[event.categoryId || ""] || event.categoryId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`whitespace-nowrap font-medium ${getBadgeColor(evtStatusStr as any)}`}>
                        {EVENT_STATUS_MAP[evtStatusStr as EventStatus] || event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={event.priority} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <PermissionGate can="canAssignIncidentResponsible">
                        <Link href={`/events/${event.id}/edit`}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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
      <div className="2xl:hidden space-y-4">
        {isLoading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={`mob-skel-${i}`} className="border rounded-xl bg-card overflow-hidden relative">
               <div className="p-4 pr-12 pb-3 space-y-3">
                 <div className="space-y-1.5">
                   <Skeleton className="h-3 w-16" />
                   <Skeleton className="h-5 w-3/4" />
                 </div>
                 <div className="flex gap-2">
                   <Skeleton className="h-5 w-20 rounded-full" />
                   <Skeleton className="h-5 w-24 rounded-full" />
                 </div>
                 <div className="flex items-center gap-2">
                   <Skeleton className="h-3.5 w-3.5 rounded-full" />
                   <Skeleton className="h-3 w-24" />
                 </div>
               </div>
               <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/5">
                 <div className="flex gap-2">
                   <Skeleton className="h-3 w-3" />
                   <Skeleton className="h-3 w-20" />
                 </div>
                 <Skeleton className="h-4 w-4 rounded-full opacity-20" />
               </div>
               <div className="absolute top-3 right-3">
                 <Skeleton className="h-8 w-8 rounded-md" />
               </div>
             </div>
           ))
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const evtStatusStr = (event.status || "").toLowerCase().replace("incident_status_", "");

            return (
              <div key={event.id} className="relative">
                <Link href={`/events/${event.id}`} className="block">
                  <Card className={`relative overflow-hidden transition-all active:scale-[0.98] border p-0 gap-0 bg-card ${getCardBorderColor(evtStatusStr as any)}`}>
                    <div className="p-4 pr-12 pb-3">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                            {event.id?.substring(0, 8)}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 break-words">
                          {typeNamesMap[event.typeId || ""] || event.typeId}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium ${getBadgeColor(evtStatusStr as any)}`}>
                          {EVENT_STATUS_MAP[evtStatusStr as EventStatus] || event.status}
                        </Badge>
                        <PriorityBadge priority={event.priority} />
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border">
                          {categoryNamesMap[event.categoryId || ""] || event.categoryId}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.registrar?.displayName || "Неизвестный"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/5 mt-1">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : ""}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  </Card>
                </Link>

                <div className="absolute top-3 right-3">
                  <PermissionGate can="canAssignIncidentResponsible">
                    <Link href={`/events/${event.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </PermissionGate>
                </div>
              </div>
            );
          })
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