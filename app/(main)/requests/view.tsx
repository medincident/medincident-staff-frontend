"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Edit,
  Wrench
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGate } from "@/components/auth/permission-gate";
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

import { getBadgeColor } from "@/lib/status-helper";
import { STATUS_MAP } from "@/lib/constants";

import {
  ServiceRequestQueryService,
  v1ServiceRequest,
} from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useRequestClassifier } from "@/lib/classifiers/request-classifier-store";

export function RequestsListView() {
  const { data: session } = useSession();
  const { orgId, isResolving: isOrgResolving } = useActiveOrgId();
  
  const [requests, setRequests] = useState<v1ServiceRequest[]>([]);
  // Типы заявок — из общего zustand-кеша (не дёргаем эндпоинт повторно).
  const { types: requestTypes } = useRequestClassifier(orgId);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (isOrgResolving) return;
    const fetchRequests = async () => {
      const userId = (session?.user as any)?.id;
      if (!userId) return;

      try {
        setIsLoading(true);
        if (!orgId) {
          setRequests([]);
          return;
        }
        // Типы заявок тянет useRequestClassifier (общий кеш) — здесь
        // запрашиваем только сами заявки.
        const reqRes =
          await ServiceRequestQueryService.serviceRequestQueryListServiceRequests(orgId, 100);

        if (reqRes && "items" in reqRes && reqRes.items) setRequests(reqRes.items);
      } catch (error) {
        console.error("Failed to load requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [session, orgId, isOrgResolving]);

  const filteredData = useMemo(() => {
    return requests.filter((req) => {
      const typeObj = requestTypes.find(t => t.id === req.typeId);
      const typeLabel = (typeObj?.name || req.typeId || "").toLowerCase();
      const desc = (req.description || "").toLowerCase();
      const num = req.id ? req.id.substring(0, 8).toLowerCase() : "";
      const term = searchTerm.toLowerCase();

      const matchesSearch = desc.includes(term) || num.includes(term) || typeLabel.includes(term);
      
      const reqStatus = (req.status || "").toLowerCase().replace("service_request_status_", "");
      const matchesStatus = statusFilter === "all" || reqStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, requestTypes, searchTerm, statusFilter]);

  const getTypeName = (typeId?: string) => {
    const t = requestTypes.find(x => x.id === typeId);
    return t?.name || typeId || "Неизвестный тип";
  };

  return (
    <div className="space-y-6 pb-20">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Заявки на обслуживание</h1>
          <p className="text-sm text-muted-foreground">АХО, ИТ, Медтехника и другие службы</p>
        </div>
        
        <PermissionGate can="canCreateRequest">
          <Link href="/requests/new" className={isLoading ? "pointer-events-none" : ""}>
            <Button className="font-semibold" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Создать заявку
            </Button>
          </Link>
        </PermissionGate>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        {isLoading ? (
          /* SKELETON FILTERS */
          <>
             <Skeleton className="h-9 flex-1 rounded-md" />
             <div className="flex gap-3 w-full md:w-auto">
                <Skeleton className="h-9 w-full sm:w-[180px] rounded-md" />
             </div>
          </>
        ) : (
          /* REAL FILTERS */
          <>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ID, описанию или типу..."
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
            </div>
          </>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden 2xl:block bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[120px] text-muted-foreground font-semibold">ID</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Тип / Описание</TableHead>
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
                     <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                     <TableCell>
                        <div className="space-y-1.5">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-48 opacity-70" />
                        </div>
                     </TableCell>
                     <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                     <TableCell><div className="flex justify-center"><Skeleton className="h-4 w-20" /></div></TableCell>
                     <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
                  </TableRow>
               ))
            ) : filteredData.length > 0 ? (
              filteredData.map((req) => {
                const reqStatus = (req.status || "").toLowerCase().replace("service_request_status_", "");
                return (
                  <TableRow
                    key={req.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = `/requests/${req.id}`}
                  >
                    <TableCell className="font-mono font-medium text-xs text-muted-foreground">#{req.id?.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[400px]">
                        <span className="font-semibold text-foreground truncate">{getTypeName(req.typeId)}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1" title={req.description}>{req.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`whitespace-nowrap font-medium ${getBadgeColor(reqStatus as any)}`}>
                        {STATUS_MAP[reqStatus as any] || req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <PermissionGate can="canAssignRequestExecutor">
                        <Link href={`/requests/${req.id}/edit`}>
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
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Заявки не найдены</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="2xl:hidden space-y-4">
        {isLoading ? (
           /* MOBILE SKELETON CARDS */
           Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-xl bg-card overflow-hidden">
                 <div className="p-4 space-y-3">
                    <div className="space-y-1.5">
                       <Skeleton className="h-3 w-16" />
                       <Skeleton className="h-5 w-3/4" />
                    </div>
                    <div className="flex gap-2">
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
          filteredData.map((req) => {
            const reqStatus = (req.status || "").toLowerCase().replace("service_request_status_", "");
            return (
              <div key={req.id} className="relative">
                <Link href={`/requests/${req.id}`} className="block">
                  <Card className={`
                          relative overflow-hidden transition-all active:scale-[0.98] border p-0 gap-0 bg-card
                      `}>
                    <div className="p-4 pr-12 pb-3">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">#{req.id?.substring(0, 8)}</span>
                        </div>
                        <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 break-words">
                          {getTypeName(req.typeId)}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={`font-medium text-[10px] h-5 px-2 ${getBadgeColor(reqStatus as any)}`}>
                          {STATUS_MAP[reqStatus as any] || req.status}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90">{req.description}</p>
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

                {/* EDIT ICON FOR MOBILE */}
                <div className="absolute top-2 right-2">
                   <PermissionGate can="canAssignRequestExecutor">
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
                   </PermissionGate>
                </div>
              </div>
            );
          })
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