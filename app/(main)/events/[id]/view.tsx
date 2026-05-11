"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  User,
  CheckCircle2,
  FileText,
  MessageSquare,
  AlertTriangle,
  Wrench,
  Plus,
  ChevronRight,
  Link2,
  Ban,
  RotateCcw,
  Flag,
  History as HistoryIcon,
} from "lucide-react";
import { notify } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatContainer } from "@/components/chat/chat-container";
import { EntityHistory } from "@/components/history/entity-history";
import { usePermissions } from "@/lib/auth/use-permissions";

import { EVENT_STATUS_MAP, INCIDENT_PRIORITY_MAP, STATUS_MAP } from "@/lib/constants";
import { EventStatus } from "@/lib/types";
import { getBadgeColor } from "@/lib/status-helper";

import {
  IncidentQueryService,
  IncidentCommandService,
  IncidentClassifierQueryService,
  MembershipQueryService,
  ServiceRequestQueryService,
  v1IncidentView,
  v1Category,
  classifierV1Type,
  v1ServiceRequest
} from "@/lib/api-generated";

interface EventDetailsViewProps {
  eventId: string;
}

function DetailsSection({
  event,
  displayTypeName,
  displayCategoryName,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  onCancel,
  onReopen,
  isMutating,
  linkedRequests,
  canManage,
}: {
  event: v1IncidentView;
  displayTypeName: string;
  displayCategoryName: string;
  status: EventStatus;
  onStatusChange: (s: EventStatus) => void;
  priority: string;
  onPriorityChange: (p: string) => void;
  onCancel: () => void;
  onReopen: () => void;
  isMutating: boolean;
  linkedRequests: v1ServiceRequest[];
  canManage: boolean;
}) {
  const isCancelled = status === "cancelled";
  return (
    <div className="space-y-6">
      <Card className="gap-3 bg-card border">
        <CardHeader>
          <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
            {displayCategoryName}
          </div>
          <CardTitle className="text-lg text-foreground">{displayTypeName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-foreground">Описание ситуации</h4>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-md">
                {event.description}
              </p>
            </div>
          )}
          <Separator className="bg-border" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            Автор: <span className="text-foreground">{event.registrar?.displayName || "Неизвестный"}</span>
          </div>
        </CardContent>
      </Card>

      {canManage && (
      <Card className="border-primary/20 bg-primary/5 gap-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Управление событием
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Текущий статус</label>
              <Select
                value={status}
                onValueChange={(v) => onStatusChange(v as EventStatus)}
                disabled={isCancelled || isMutating}
              >
                <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border">
                  {Object.entries(EVENT_STATUS_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1">
                <Flag className="h-3 w-3" /> Приоритет
              </label>
              <Select
                value={priority}
                onValueChange={onPriorityChange}
                disabled={isCancelled || isMutating}
              >
                <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                  <SelectValue placeholder="Не задан" />
                </SelectTrigger>
                <SelectContent className="border">
                  {Object.entries(INCIDENT_PRIORITY_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-primary/10" />

          <div className="flex flex-col sm:flex-row gap-2">
            {isCancelled ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-primary/20 text-primary hover:bg-primary/10"
                onClick={onReopen}
                disabled={isMutating}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Возобновить событие
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onCancel}
                disabled={isMutating}
              >
                <Ban className="mr-2 h-4 w-4" />
                Отменить событие
              </Button>
            )}
          </div>

          {isCancelled && (
            <p className="text-[11px] text-muted-foreground bg-muted/40 border rounded px-2 py-1.5">
              Событие отменено. Чтобы менять статус и приоритет — сначала возобновите его.
            </p>
          )}
        </CardContent>
      </Card>
      )}

      <Card className="gap-3 bg-card border">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Связанные заявки
              {linkedRequests.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {linkedRequests.length}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedRequests.length > 0 ? (
            <div className="space-y-2">
              {linkedRequests.map((req) => {
                const reqStatus = (req.status || "").toLowerCase().replace("service_request_status_", "");
                return (
                  <div
                    key={req.id}
                    className="group relative rounded-md border bg-background hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <Link
                      href={`/requests/${req.id}`}
                      className="flex items-center justify-between gap-3 p-3 pr-10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-bold text-muted-foreground">
                            #{req.id?.substring(0, 8)}
                          </span>
                          <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${getBadgeColor(reqStatus as any)}`}>
                            {STATUS_MAP[reqStatus as any] || req.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
                          {req.typeId}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {req.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              К этому событию пока не привязана ни одна заявка.
            </p>
          )}

          <div className="pt-2">
            <Link href={`/requests/new?linkedEventId=${event.id}`} className="block">
              <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary">
                <Plus className="mr-2 h-4 w-4" />
                Создать связанную заявку
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EventDetailsView({ eventId }: EventDetailsViewProps) {
  const router = useRouter();
  const perms = usePermissions();
  const canManage = perms.canAssignIncidentResponsible;
  const { data: session } = useSession();

  const [event, setEvent] = useState<v1IncidentView | null>(null);
  const [categories, setCategories] = useState<v1Category[]>([]);
  const [types, setTypes] = useState<classifierV1Type[]>([]);
  const [linkedRequests, setLinkedRequests] = useState<v1ServiceRequest[]>([]);
  const [status, setStatus] = useState<EventStatus>("created");
  const [priority, setPriority] = useState<string>("normal");

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const userId = (session?.user as any)?.id;
      if (!userId) return;
      
      try {
        setIsLoading(true);

        const incidentRes = await IncidentQueryService.incidentQueryGetIncident(eventId);
        
        if (!incidentRes || !("incident" in incidentRes) || !incidentRes.incident) {
          setNotFound(true);
          return;
        }

        const foundEvent = incidentRes.incident;
        setEvent(foundEvent);
        
        const evtStatus = (foundEvent.status || "").toLowerCase().replace("incident_status_", "") as EventStatus;
        setStatus(evtStatus || "created");

        const evtPriority = (foundEvent.priority || "").toLowerCase().replace("incident_priority_", "");
        setPriority(evtPriority || "normal");

        // Загружаем связанные заявки
        try {
          const reqs = await ServiceRequestQueryService.serviceRequestQueryListServiceRequestsByIncident(eventId, 100);
          if (reqs && "items" in reqs && reqs.items) {
            setLinkedRequests(reqs.items);
          }
        } catch (e) {
          console.warn("Could not load linked requests", e);
        }

        // Получаем организацию для загрузки классификаторов (если есть organizationId в событии)
        if (foundEvent.organizationId) {
          const [catsRes, typesRes] = await Promise.all([
            IncidentClassifierQueryService.incidentClassifierQueryListCategoriesByOrganization(foundEvent.organizationId, 100),
            IncidentClassifierQueryService.incidentClassifierQueryListActiveTypesByOrganization(foundEvent.organizationId, 100)
          ]);

          if (catsRes && "items" in catsRes && catsRes.items) {
            setCategories(catsRes.items);
          }
          if (typesRes && "items" in typesRes && typesRes.items) {
            setTypes(typesRes.items);
          }
        }
      } catch (error) {
        console.error("Failed to load event:", error);
        notify.error("Ошибка загрузки данных", "Не удалось получить информацию о событии.");
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId, session]);

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!event || !event.id) return;

    const prevStatus = status;
    setStatus(newStatus);

    try {
      let apiStatus = newStatus.toUpperCase();
      if (!apiStatus.startsWith("INCIDENT_STATUS_")) {
        apiStatus = `INCIDENT_STATUS_${apiStatus}`;
      }
      
      await IncidentCommandService.incidentCommandUpdateIncidentStatus(event.id, {
        newStatus: apiStatus as any
      });

      const updatedEvent = { ...event, status: apiStatus as any };
      setEvent(updatedEvent);
      
      notify.mutationSuccess(
        "Статус обновлён",
        `Событие переведено в статус "${EVENT_STATUS_MAP[newStatus]}".`,
      );
    } catch (error) {
      console.error(error);
      setStatus(prevStatus);
      notify.mutationError("Ошибка", "Не удалось обновить статус события.");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!event?.id) return;
    const prev = priority;
    setPriority(newPriority);
    setIsMutating(true);
    try {
      const apiPriority = `INCIDENT_PRIORITY_${newPriority.toUpperCase()}`;
      await IncidentCommandService.incidentCommandUpdateIncidentPriority(event.id, {
        priority: apiPriority as any,
      });
      setEvent({ ...event, priority: apiPriority as any });
      notify.mutationSuccess(
        "Приоритет обновлён",
        `Установлен приоритет «${INCIDENT_PRIORITY_MAP[newPriority] ?? newPriority}».`,
      );
    } catch (error) {
      console.error(error);
      setPriority(prev);
      notify.mutationError("Ошибка", "Не удалось обновить приоритет.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancel = async () => {
    if (!event?.id) return;
    if (!confirm("Отменить событие? Статус и приоритет станут недоступны для изменения, пока вы не возобновите событие.")) {
      return;
    }
    setIsMutating(true);
    try {
      await IncidentCommandService.incidentCommandCancelIncident(event.id);
      setStatus("cancelled" as EventStatus);
      setEvent({ ...event, status: "INCIDENT_STATUS_CANCELLED" as any });
      notify.mutationSuccess("Событие отменено", "Запись помечена как отменённая.");
    } catch (error) {
      console.error(error);
      notify.mutationError("Ошибка", "Не удалось отменить событие.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReopen = async () => {
    if (!event?.id) return;
    setIsMutating(true);
    try {
      await IncidentCommandService.incidentCommandReopenIncident(event.id);
      setStatus("created" as EventStatus);
      setEvent({ ...event, status: "INCIDENT_STATUS_PENDING" as any });
      notify.mutationSuccess("Событие возобновлено", "Можно снова менять статус и приоритет.");
    } catch (error) {
      console.error(error);
      notify.mutationError("Ошибка", "Не удалось возобновить событие.");
    } finally {
      setIsMutating(false);
    }
  };

  const { displayTypeName, displayCategoryName } = useMemo(() => {
    if (!event) return { displayTypeName: "...", displayCategoryName: "..." };

    let typeName = event.typeId || "";
    let categoryName = event.categoryId || "";

    const category = categories.find(c => c.id === event.categoryId);
    if (category && category.name) {
      categoryName = category.name;
    }
    const type = types.find(t => t.id === event.typeId);
    if (type && type.name) {
      typeName = type.name;
    }

    return { displayTypeName: typeName, displayCategoryName: categoryName };
  }, [event, categories, types]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] xl:h-auto pb-4 xl:pb-20">
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32 sm:w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24 sm:w-32" />
          </div>
        </div>

        <div className="hidden xl:grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2 space-y-6">
            <div className="border rounded-xl p-6 bg-card space-y-4 shadow-sm">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-1/2" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="border border-primary/10 rounded-xl p-6 bg-primary/5 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="col-span-1 h-150 border rounded-xl overflow-hidden flex flex-col bg-card">
            <div className="h-12 border-b bg-muted/20 p-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex-1 bg-muted/5 p-4 space-y-4 overflow-hidden">
              <Skeleton className="h-16 w-3/4 rounded-2xl rounded-tl-none bg-muted/20" />
              <Skeleton className="h-10 w-1/2 rounded-2xl rounded-tr-none ml-auto bg-muted/30" />
              <Skeleton className="h-20 w-5/6 rounded-2xl rounded-tl-none bg-muted/20" />
            </div>
            <div className="h-16 border-t p-3 bg-background">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        </div>

        <div className="xl:hidden flex-1 flex flex-col">
          <Skeleton className="h-12 w-full rounded-lg mb-4 shrink-0" />
          <div className="border rounded-xl p-4 bg-card space-y-4 flex-1">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-32 w-full rounded-md" />
            <Separator />
            <Skeleton className="h-10 w-full rounded-md mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Событие не найдено</h1>
        <p className="text-muted-foreground mt-2 max-w-sm mb-6">
          Возможно, оно было удалено или у вас нет прав на просмотр.
        </p>
        <Button onClick={() => router.push("/events")}>Вернуться к списку</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] xl:h-auto pb-4 xl:pb-20">
      <div className="flex items-start gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0 hover:bg-muted">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-lg font-bold text-foreground line-clamp-2 break-words min-w-0">
              Событие #{event.id?.substring(0, 8)}
            </h1>
            <Badge variant="outline" className={`shrink-0 ${getBadgeColor(status)}`}>
              {EVENT_STATUS_MAP[status] || status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            Создано {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}
          </p>
        </div>
      </div>

      <div className="xl:hidden flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 h-12 p-1 mb-4 bg-muted rounded-lg border shrink-0">
            <TabsTrigger value="details" className="flex gap-1.5 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" /> <span>Детали</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex gap-1.5 data-[state=active]:bg-background">
              <HistoryIcon className="h-4 w-4" /> <span>История</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex gap-1.5 data-[state=active]:bg-background">
              <MessageSquare className="h-4 w-4" /> <span>Чат</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
            <DetailsSection
              event={event}
              displayTypeName={displayTypeName}
              displayCategoryName={displayCategoryName}
              status={status}
              onStatusChange={handleStatusChange}
              priority={priority}
              onPriorityChange={handlePriorityChange}
              onCancel={handleCancel}
              onReopen={handleReopen}
              isMutating={isMutating}
              linkedRequests={linkedRequests}
              canManage={canManage}
            />
          </TabsContent>
          <TabsContent value="history" className="flex-1 overflow-y-auto mt-0">
            <EntityHistory entityType="incident" entityId={eventId} />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 h-full mt-0 overflow-hidden">
            <ChatContainer entityId={eventId} entityType="events" />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden xl:grid grid-cols-3 gap-6 items-start">
        <div className="col-span-2 space-y-6">
          <DetailsSection
            event={event}
            displayTypeName={displayTypeName}
            displayCategoryName={displayCategoryName}
            status={status}
            onStatusChange={handleStatusChange}
            priority={priority}
            onPriorityChange={handlePriorityChange}
            onCancel={handleCancel}
            onReopen={handleReopen}
            isMutating={isMutating}
            linkedRequests={linkedRequests}
            canManage={canManage}
          />

          <EntityHistory entityType="incident" entityId={eventId} />
        </div>
        <div className="col-span-1 sticky top-24 h-[600px]">
          <ChatContainer entityId={eventId} entityType="events" />
        </div>
      </div>
    </div>
  );
}
