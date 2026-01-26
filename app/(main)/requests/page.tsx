"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  Edit,
  Wrench
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getBadgeColor, getCardBorderColor } from "@/lib/status-helper";
import { SERVICE_TYPE_CONFIG, STATUS_MAP, PRIORITY_MAP } from "@/lib/constants";
import { ServiceRequest } from "@/lib/types";

export default function RequestsListPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/requests");
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to load requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredData = useMemo(() => {
    return requests.filter((req) => {
      const typeLabel = SERVICE_TYPE_CONFIG[req.type]?.label.toLowerCase() || "";
      const desc = req.description.toLowerCase();
      const num = req.number.toString();
      const loc = req.location ? req.location.toLowerCase() : "";
      const term = searchTerm.toLowerCase();

      const matchesSearch = desc.includes(term) || num.includes(term) || loc.includes(term) || typeLabel.includes(term);
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6 pb-20">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Заявки на обслуживание</h1>
          <p className="text-sm text-muted-foreground">АХО, ИТ, Медтехника и другие службы</p>
        </div>
        
        {/* ИСПРАВЛЕНИЕ: Кнопка теперь неактивна при загрузке */}
        <Link href="/requests/new" className={isLoading ? "pointer-events-none" : ""}>
          <Button className="font-semibold" disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Создать заявку
          </Button>
        </Link>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        {isLoading ? (
          /* SKELETON FILTERS */
          <>
             <Skeleton className="h-9 flex-1 rounded-md" />
             <div className="flex gap-3 w-full md:w-auto">
                <Skeleton className="h-9 w-full sm:w-[180px] rounded-md" />
                <Skeleton className="h-9 w-full sm:w-[180px] rounded-md" />
             </div>
          </>
        ) : (
          /* REAL FILTERS */
          <>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру, описанию или кабинету..."
                className="pl-9 bg-background focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <div className="flex items-center gap-2 text-muted-foreground"><Filter className="h-4 w-4" /><SelectValue placeholder="Статус" /></div>
                </SelectTrigger>
                <SelectContent className="border">
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(STATUS_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><SelectValue placeholder="Приоритет" /></div>
                </SelectTrigger>
                <SelectContent className="border">
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  {Object.entries(PRIORITY_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] text-muted-foreground font-semibold">Номер</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Тип / Описание</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Место</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Приоритет</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Статус</TableHead>
              <TableHead className="text-center text-muted-foreground font-semibold">Дата</TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               /* DESKTOP SKELETON ROWS */
               Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                     <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                     <TableCell>
                        <div className="space-y-1.5">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-48 opacity-70" />
                        </div>
                     </TableCell>
                     <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                     <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                     <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                     <TableCell><div className="flex justify-center"><Skeleton className="h-4 w-20" /></div></TableCell>
                     <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
                  </TableRow>
               ))
            ) : filteredData.length > 0 ? (
              filteredData.map((req) => (
                <TableRow
                  key={req.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/requests/${req.id}`}
                >
                  <TableCell className="font-mono font-medium text-xs text-muted-foreground">#{req.number}</TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[300px]">
                      <span className="font-semibold text-foreground truncate">{SERVICE_TYPE_CONFIG[req.type]?.label || req.type}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1" title={req.description}>{req.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{req.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-medium text-[10px] whitespace-nowrap ${getBadgeColor(req.priority)}`}>
                      {PRIORITY_MAP[req.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`whitespace-nowrap font-medium ${getBadgeColor(req.status)}`}>{STATUS_MAP[req.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs whitespace-nowrap">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/requests/${req.id}/edit`}>
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
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Заявки не найдены</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
           /* MOBILE SKELETON CARDS */
           Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-xl bg-card overflow-hidden">
                 <div className="p-4 space-y-3">
                    <div className="space-y-1.5">
                       <Skeleton className="h-3 w-12" />
                       <Skeleton className="h-5 w-3/4" />
                    </div>
                    <div className="flex gap-2">
                       <Skeleton className="h-5 w-20 rounded-md" />
                       <Skeleton className="h-5 w-24 rounded-md" />
                    </div>
                    <div className="space-y-1">
                       <Skeleton className="h-3 w-full" />
                       <Skeleton className="h-3 w-2/3" />
                    </div>
                 </div>
                 <div className="flex justify-between px-4 py-3 bg-muted/5 border-t">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                 </div>
              </div>
           ))
        ) : filteredData.length > 0 ? (
          filteredData.map((req) => (
            <div key={req.id} className="relative">
              <Link href={`/requests/${req.id}`} className="block">
                <Card className={`
                        relative overflow-hidden transition-all active:scale-[0.98] border p-0 gap-0 bg-card
                        ${getCardBorderColor(req.priority)}
                    `}>
                  <div className="p-4 pr-12 pb-3">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">#{req.number}</span>
                      </div>
                      <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-1">
                        {SERVICE_TYPE_CONFIG[req.type]?.label || req.type}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={`font-medium text-[10px] h-5 px-2 ${getBadgeColor(req.status)}`}>
                        {STATUS_MAP[req.status]}
                      </Badge>
                      <Badge variant="outline" className={`font-medium text-[10px] h-5 px-2 ${getBadgeColor(req.priority)}`}>
                        {PRIORITY_MAP[req.priority]}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90">{req.description}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{req.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/5 mt-1">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                </Card>
              </Link>

              {/* EDIT ICON FOR MOBILE (ABSOLUTE POSITION) */}
              <div className="absolute top-2 right-2">
                 <Link href={`/requests/${req.id}/edit`}>
                    <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-9 w-9 text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
                       onClick={(e) => e.stopPropagation()}
                    >
                       <Edit className="h-4 w-4" />
                    </Button>
                 </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card rounded-2xl border border-dashed">
            <Wrench className="h-10 w-10 mb-3 opacity-20" />
            <span className="text-sm font-medium">Заявки не найдены</span>
          </div>
        )}
      </div>
    </div>
  );
}