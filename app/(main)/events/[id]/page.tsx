"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  CheckCircle2,
  FileText,
  MessageSquare,
  Wrench
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { EVENT_STATUS_MAP } from "@/lib/constants";
import { IncidentEvent, EventStatus, Category } from "@/lib/types";
import { getBadgeColor } from "@/lib/status-helper";
import { EventChatContainer } from "@/components/events/event-chat-container";

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [event, setEvent] = useState<IncidentEvent | null>(null);
  const [classifier, setClassifier] = useState<Category[]>([]);
  const [status, setStatus] = useState<EventStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const [eventRes, classifierRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/classifier`)
        ]);

        if (eventRes.ok && classifierRes.ok) {
          const eventData = await eventRes.json();
          const classifierData = await classifierRes.json();

          setEvent(eventData);
          setClassifier(classifierData);
          setStatus(eventData.status as EventStatus);
        } else {
            toast.error("Не удалось загрузить событие");
        }
      } catch (error) {
        console.error("Network error:", error);
        toast.error("Ошибка сети");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const typeNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    classifier.forEach(cat => {
      cat.types.forEach(t => { map[t.id] = t.name; });
    });
    return map;
  }, [classifier]);

  const categoryNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    classifier.forEach(cat => { map[cat.id] = cat.name; });
    return map;
  }, [classifier]);

  const handleStatusChange = async (newStatus: EventStatus) => {
    setStatus(newStatus);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Статус обновлен", { description: `Событие переведено в статус "${EVENT_STATUS_MAP[newStatus]}"` });
    } catch (error) {
      console.error(error);
      toast.error("Ошибка", { description: "Не удалось обновить статус" });
    }
  };

  // --- HELPER COMPONENT ---
  const DetailsSection = () => {
    if (!event) return null;

    const displayTypeName = typeNamesMap[event.typeId || ""] || event.typeName || event.typeId;
    const displayCategoryName = categoryNamesMap[event.categoryId] || event.categoryName || event.categoryId;

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
              <Select value={status as string} onValueChange={(v) => handleStatusChange(v as EventStatus)}>
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

            {/* <div className="pt-2 border-t border-primary/10 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start text-foreground border-primary/20 hover:bg-background hover:border-primary/40 transition-colors"
                onClick={() => router.push(`/requests/new?linkedEventId=${event.id}`)}
              >
                <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                Создать техническую заявку
              </Button>
              <p className="text-[10px] text-muted-foreground px-1">
                Создаст наряд на работы, привязанный к этому инциденту.
              </p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] xl:h-auto pb-4 xl:pb-20">
      
      {/* HEADER: Виден всегда, shrink-0 чтобы не сжимался */}
      <div className="flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0 hover:bg-muted">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        
        <div className="min-w-0 flex-1">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                </div>
            ) : event ? (
                <>
                    <h1 className="text-lg font-bold text-foreground flex items-center gap-2 truncate">
                        Событие #{event.code || id}
                        <Badge variant="outline" className={`ml-1 shrink-0 ${getBadgeColor(status as string)}`}>
                            {EVENT_STATUS_MAP[status as EventStatus] || status}
                        </Badge>
                    </h1>
                    <p className="text-xs text-muted-foreground truncate">Создано {new Date(event.createdAt).toLocaleString()}</p>
                </>
            ) : (
                <h1 className="text-lg font-bold text-foreground">Событие не найдено</h1>
            )}
        </div>
      </div>

      {/* CONTENT SWITCHER */}
      {isLoading ? (
        /* --- SKELETON LAYOUT --- */
        <div className="flex-1 flex flex-col min-h-0"> {/* flex-1 чтобы занять остаток высоты */}
            
            {/* Desktop Skeleton */}
            <div className="hidden xl:grid grid-cols-3 gap-6 items-start">
                <div className="col-span-2 space-y-6">
                    <div className="border rounded-xl bg-card p-6 space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-3/4" />
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-32" /> 
                            <Skeleton className="h-20 w-full rounded-md" />
                        </div>
                    </div>
                    <div className="border rounded-xl bg-card p-6 space-y-8">
                        <Skeleton className="h-5 w-48 mb-10" />
                        <Skeleton className="h-12 w-full rounded-md" />
                        {/* <Skeleton className="h-12 w-full rounded-md" /> */}
                    </div>
                </div>
                <div className="col-span-1 h-[600px] rounded-xl border bg-card p-4 flex flex-col">
                    <Skeleton className="h-10 w-full mb-4" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-12 w-3/4 rounded-lg" />
                        <Skeleton className="h-12 w-3/4 rounded-lg ml-auto" />
                    </div>
                </div>
            </div>

            {/* Mobile Skeleton (имитация табов и контента) */}
            <div className="xl:hidden flex flex-col h-full">
                <Skeleton className="h-12 w-full rounded-lg mb-4 shrink-0" />
                <div className="space-y-6">
                    <div className="border rounded-xl bg-card p-6 space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="border rounded-xl bg-card p-6 space-y-4">
                        <Skeleton className="h-5 w-40 mb-10" />
                        <Skeleton className="h-14 w-full" />
                        {/* <Skeleton className="h-14 w-full" /> */}
                    </div>
                </div>
            </div>
        </div>
      ) : event ? (
        /* --- REAL CONTENT --- */
        <>
          {/* MOBILE VIEW: Вернул твою структуру с flex-1 min-h-0 */}
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
                <DetailsSection />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 h-full mt-0 overflow-hidden">
                <EventChatContainer eventId={id} className="h-full" />
              </TabsContent>
            </Tabs>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden xl:grid grid-cols-3 gap-6 items-start">
            <div className="col-span-2 space-y-6">
              <DetailsSection />
            </div>
            <div className="col-span-1 sticky top-24 h-[600px]">
              <EventChatContainer eventId={id} />
            </div>
          </div>
        </>
      ) : (
        /* --- NOT FOUND --- */
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <h2 className="text-xl font-bold text-muted-foreground">Данные отсутствуют</h2>
            <Button onClick={() => router.back()} variant="outline">Вернуться</Button>
        </div>
      )}
    </div>
  );
}