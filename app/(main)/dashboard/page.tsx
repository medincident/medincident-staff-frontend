"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Briefcase,
  Bell,
  CalendarDays,
  Siren,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  Activity,
  FileText // Added icon for the header
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  STATUS_MAP,
  SERVICE_TYPE_CONFIG
} from "@/lib/constants";
import { getBadgeColor } from "@/lib/status-helper";
import { User, ServiceRequest, Announcement, IncidentEvent, Category } from "@/lib/types";

const safeDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Недавно";
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classifier, setClassifier] = useState<Category[]>([]); 

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [userRes, eventsRes, requestsRes, announcementsRes, classifierRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/events'),
          fetch('/api/requests'),
          fetch('/api/announcements'),
          fetch('/api/classifier') 
        ]);

        if (userRes.ok) setUser(await userRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
        if (requestsRes.ok) setRequests(await requestsRes.json());
        if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
        if (classifierRes.ok) setClassifier(await classifierRes.json());

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Логика фильтрации
  const activeEvents = events.filter(e => e.status !== 'closed' && e.status !== 'completed');
  
  const activeRequests = requests.filter(r => 
    r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'refused'
  );

  const criticalRequestsCount = activeRequests.filter(r => r.priority === 'critical').length;
  const recentEvents = events.slice(0, 3);
  
  // Сортируем заявки: сначала критические, потом остальные, макс 3
  const myActiveRequests = activeRequests
    .sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (b.priority === 'critical' && a.priority !== 'critical') return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">

      {/* HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
            Ситуационный центр
          </h1>
          
          {isLoading ? (
             <div className="flex gap-3 mt-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
             </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground mt-1 text-sm">
                <span className="flex items-center gap-1 whitespace-nowrap">
                <Briefcase className="h-3.5 w-3.5" />
                {user?.role || "Гость"}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link href="/requests/new" className={`w-full sm:w-auto flex-1 ${isLoading ? 'pointer-events-none' : ''}`}>
            {/* <Button
              variant="outline"
              disabled={isLoading}
              className="w-full h-12 px-6 text-base font-medium border border-primary text-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Wrench className="mr-2 h-5 w-5" />
              Тех. заявка
            </Button> */}
          </Link>

          <Link href="/events/new" className={`w-full sm:w-auto flex-1 ${isLoading ? 'pointer-events-none' : ''}`}>
            <Button
              className="w-full h-12 px-6 text-base font-bold transition-all"
              disabled={isLoading}
            >
              <Siren className="mr-2 h-5 w-5 animate-pulse" />
              ЗАРЕГИСТРИРОВАТЬ НС
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="В расследовании (НС)"
          value={isLoading ? <Skeleton className="h-8 w-12 rounded-md" /> : activeEvents.length}
          desc="Безопасность"
          icon={ShieldAlert}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        
        <StatsCard
          title="Всего в работе"
          value={isLoading ? <Skeleton className="h-8 w-12 rounded-md" /> : myActiveRequests.length}
          desc="Технические работы"
          icon={Wrench}
          iconColor="text-muted-foreground"
          iconBg="bg-muted"
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN: TABS (Journal & Requests) */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          <Tabs defaultValue="ns" className="w-full">
            <div>
              {/* Пока что так */}
              <div className="flex items-center gap-2">
                 <h2 className="text-lg font-semibold text-foreground">Журнал событий</h2>
              </div>
              
              {/* <TabsList className="flex w-full p-1 bg-muted rounded-lg">
                <TabsTrigger value="ns" className="flex-1 truncate">Журнал событий</TabsTrigger>
                <TabsTrigger value="requests" className="flex-1 truncate">Заявки</TabsTrigger>
              </TabsList> 
              */}
            </div>

            <TabsContent value="ns" className="space-y-3 mt-0">
              {isLoading ? (
                 /* SKELETONS FOR EVENTS */
                 Array.from({length: 3}).map((_, i) => (
                    <div key={`ev-skel-${i}`} className="flex items-center justify-between p-4 bg-card border rounded-xl border-border">
                        <div className="flex items-center gap-4 w-full">
                            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                            <div className="space-y-2 flex-1 py-0.5">
                                <Skeleton className="h-3 w-16 rounded-sm" />
                                <Skeleton className="h-4 w-3/4 rounded-sm" />
                                <Skeleton className="h-3 w-1/2 rounded-sm" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-5 rounded-full ml-2 shrink-0 opacity-20" />
                    </div>
                 ))
              ) : recentEvents.length > 0 ? (
                <>
                  {recentEvents.map(evt => (
                    <EventItem
                      key={evt.id}
                      evt={evt}
                      typeMap={typeNamesMap}
                      catMap={categoryNamesMap}
                    />
                  ))}

                  <Link href="/events" className="block pt-2">
                    <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary">
                      Перейти в полный журнал событий
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <EmptyState text="Инцидентов не зафиксировано" icon={CheckCircle2} />
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-3 mt-0">
              {/* Контент заявок (скрыт, так как нет триггера) */}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: ANNOUNCEMENTS ONLY */}
        <div className="space-y-6 min-w-0">

          {/* Announcements Widget */}
          <Card className="gap-0 py-0! overflow-hidden">
            <CardHeader className="p-3 pb-3! border-b bg-muted/40 space-y-0 gap-y-0 pt-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 shrink-0" />
                Важные объявления
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 pt-4 pb-4 space-y-4">
              {isLoading ? (
                 /* SKELETONS FOR ANNOUNCEMENTS */
                 Array.from({length: 3}).map((_, i) => (
                    <div key={`ann-skel-${i}`} className="space-y-2 pl-3 relative">
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-muted" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-2 w-2/3" />
                        {i < 2 && <Separator className="my-4 opacity-0" />} 
                    </div>
                 ))
              ) : announcements.length > 0 ? (
                announcements.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex gap-3 items-start relative pl-3">
                      <div className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 ${item.priority === 'high' ? 'bg-primary' : 'bg-muted-foreground'}`} />

                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed wrap-break-word">
                          {item.content}
                        </p>
                      </div>
                    </div>
                    {index < announcements.length - 1 && <Separator className="my-4" />}
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-muted-foreground py-2">
                  Нет новых объявлений
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// --- КОМПОНЕНТЫ ---
function EventItem({ evt, typeMap, catMap }: { evt: IncidentEvent, typeMap: Record<string, string>, catMap: Record<string, string> }) {
  const typeName = typeMap[evt.typeId || ""] || evt.typeName || evt.typeId;
  const categoryName = catMap[evt.categoryId] || evt.categoryName || evt.categoryId;

  return (
    <Link
      href={`/events/${evt.id}`}
      className={`group flex items-center justify-between p-4 bg-card border rounded-xl transition-all cursor-pointer border-border`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className=
        {`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border bg-primary/10 border-primary/20 text-primary`}>
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-muted-foreground whitespace-nowrap">{evt.code}</span>
          </div>
          <h4 className="font-bold text-sm text-foreground line-clamp-1 break-all transition-colors group-hover:text-primary">
            {typeName}
          </h4>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-foreground/80">{categoryName}</span>
            <span className="text-border">|</span>
            <span className="whitespace-nowrap">{safeDate(evt.createdAt)}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-colors shrink-0 ml-2 group-hover:text-primary" />
    </Link>
  )
}

function RequestItem({ req }: { req: ServiceRequest }) {
  const isCritical = req.priority === 'critical';
  const typeLabel = SERVICE_TYPE_CONFIG[req.type]?.label || req.type;

  return (
    <Link
      href={`/requests/${req.id}`}
      className={`
        group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer
        ${isCritical 
          ? "bg-destructive/5 border-destructive hover:border-destructive" 
          : "bg-card border-border hover:border-primary/30"
        }
      `}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Иконка слева */}
        <div className={`
          h-10 w-10 shrink-0 rounded-full flex items-center justify-center
          ${isCritical ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
        `}>
          {isCritical ? <Siren className="h-5 w-5 animate-pulse" /> : (req.type.includes('med') ? <Activity className="h-5 w-5" /> : <Wrench className="h-5 w-5" />)}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">#{req.number}</span>

            {/* БЕЙДЖ КАТЕГОРИИ */}
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 rounded-sm whitespace-nowrap">
              {typeLabel}
            </span>
            
            {/* БЕЙДЖ КРИТИЧНОСТИ */}
            {isCritical && (
                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap flex items-center gap-1 border border-destructive/20">
                    <Siren className="h-3 w-3" />
                    КРИТИЧЕСКАЯ
                </span>
            )}

          </div>

          <h4 className={`font-medium text-sm line-clamp-1 opacity-90 transition-colors break-all ${isCritical ? "text-destructive font-bold" : "text-foreground group-hover:text-primary group-hover:opacity-100"}`}>
            {req.description}
          </h4>
        </div>
      </div>
      
      {/* Правая часть со статусом */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <Badge variant="outline" className={`whitespace-nowrap ${getBadgeColor(req.status)}`}>
          {STATUS_MAP[req.status]}
        </Badge>

        <ChevronRight className={`h-4 w-4 transition-colors ${isCritical ? "text-destructive/50 group-hover:text-destructive" : "text-muted-foreground/30 group-hover:text-primary"}`} />
      </div>
    </Link>
  )
}

function StatsCard({ title, value, desc, icon: Icon, className, pulse, iconColor, iconBg }: any) {
  return (
    <Card className={`border py-2! relative overflow-hidden group transition-all h-full ${className}`}>
      <CardContent className="p-5 flex flex-col gap-1 relative z-10 h-full justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${iconBg} ${iconColor} ${pulse ? 'animate-pulse' : ''}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
            <div className="text-sm font-medium text-muted-foreground truncate">{title}</div>
            <div className="text-[10px] text-muted-foreground/70 truncate">{desc}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text, icon: Icon }: any) {
  return (
    <div className="text-center py-10 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2">
      <div className="p-3 bg-muted/50 rounded-full">{Icon ? <Icon className="h-6 w-6 text-muted-foreground/50" /> : <Briefcase className="h-6 w-6 text-muted-foreground/50" />}</div>
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  )
}