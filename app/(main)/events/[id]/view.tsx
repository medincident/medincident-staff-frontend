"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  CheckCircle2,
  FileText,
  MessageSquare,
  AlertTriangle
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

import { EVENT_STATUS_MAP } from "@/lib/constants";
import { IncidentEvent, EventStatus, Category } from "@/lib/types";
import { getBadgeColor } from "@/lib/status-helper";
import { eventsDb, CLASSIFIER_DB } from "@/lib/mock-db";

interface EventDetailsViewProps {
  eventId: string;
}

function DetailsSection({
  event,
  displayTypeName,
  displayCategoryName,
  status,
  onStatusChange,
}: {
  event: IncidentEvent;
  displayTypeName: string;
  displayCategoryName: string;
  status: EventStatus;
  onStatusChange: (s: EventStatus) => void;
}) {
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
            Автор: <span className="text-foreground">{event.author}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 gap-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Управление событием
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">Текущий статус</label>
            <Select value={status} onValueChange={(v) => onStatusChange(v as EventStatus)}>
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
        </CardContent>
      </Card>
    </div>
  );
}

export function EventDetailsView({ eventId }: EventDetailsViewProps) {
  const router = useRouter();

  const [event, setEvent] = useState<IncidentEvent | null>(null);
  const [classifier, setClassifier] = useState<Category[]>([]);
  const [status, setStatus] = useState<EventStatus>("created");

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundEvent = eventsDb.find((e) => e.id === eventId);

        if (!foundEvent) {
          setNotFound(true);
        } else {
          setEvent(foundEvent);
          setClassifier(CLASSIFIER_DB);
          setStatus(foundEvent.status as EventStatus);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
        notify.error("Ошибка загрузки данных", "Не удалось получить информацию о событии.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!event) return;

    const prevStatus = status;
    setStatus(newStatus);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const updatedEvent = { ...event, status: newStatus };

      const eventIndex = eventsDb.findIndex(e => e.id === eventId);
      if (eventIndex > -1) {
        eventsDb[eventIndex] = updatedEvent;
      }

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

  const { displayTypeName, displayCategoryName } = useMemo(() => {
    if (!event) return { displayTypeName: "...", displayCategoryName: "..." };

    let typeName = event.typeName || event.typeId;
    let categoryName = event.categoryName || event.categoryId;

    const category = classifier.find(c => c.id === event.categoryId);
    if (category) {
      categoryName = category.name;
      const type = category.types.find(t => t.id === event.typeId);
      if (type) typeName = type.name;
    }

    return { displayTypeName: typeName, displayCategoryName: categoryName };
  }, [event, classifier]);

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
              Событие #{event.code}
            </h1>
            <Badge variant="outline" className={`shrink-0 ${getBadgeColor(status)}`}>
              {EVENT_STATUS_MAP[status] || status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            Создано {new Date(event.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="xl:hidden flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 mb-4 bg-muted rounded-lg border shrink-0">
            <TabsTrigger value="details" className="flex gap-2 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" /> <span>Детали</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex gap-2 data-[state=active]:bg-background">
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
            />
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
          />
        </div>
        <div className="col-span-1 sticky top-24 h-[600px]">
          <ChatContainer entityId={eventId} entityType="events" />
        </div>
      </div>
    </div>
  );
}
