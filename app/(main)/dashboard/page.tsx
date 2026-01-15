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
  Activity
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  EVENT_SEVERITY_MAP, 
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
  const [classifier, setClassifier] = useState<Category[]>([]); // Добавили стейт для справочника
  
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
            fetch('/api/classifier') // Загружаем справочник
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

  // Создаем словари для быстрого перевода ID -> Название
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

  const activeEvents = events.filter(e => e.status !== 'closed' && e.status !== 'completed');
  const criticalEvents = activeEvents.filter(e => e.severity === 'critical');
  
  const recentEvents = events.slice(0, 3);
  const myActiveRequests = requests
    .filter(r => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'refused')
    .slice(0, 3);
  
  const isSafetyManager = user ? (['dispatcher_ns', 'admin_org', 'head_clinic', 'admin_system'].includes(user.role)) : false;

  if (isLoading || !user) {
    return (
        <div className="space-y-6 pb-20">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border">
                <div className="space-y-2 w-full md:w-auto">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Skeleton className="h-12 flex-1 md:w-32" />
                    <Skeleton className="h-12 flex-1 md:w-48" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      
      {/* HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
            Ситуационный центр
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground mt-1 text-sm">
             <span className="flex items-center gap-1 whitespace-nowrap">
               <Briefcase className="h-3.5 w-3.5" />
               {user.role}
             </span>
             <span className="text-border">|</span>
             <span className="flex items-center gap-1 whitespace-nowrap">
               <CalendarDays className="h-3.5 w-3.5" />
               {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
             </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <Link href="/requests/new" className="w-full sm:w-auto flex-1">
            <Button 
                variant="outline" 
                className="w-full h-12 px-6 text-base font-medium border border-primary text-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Wrench className="mr-2 h-5 w-5" />
              Тех. заявка
            </Button>
          </Link>
          
          <Link href="/events/new" className="w-full sm:w-auto flex-1">
            <Button 
                className="w-full h-12 px-6 text-base font-bold hover:shadow-lg transition-all"
            >
              <Siren className="mr-2 h-5 w-5 animate-pulse" />
              ЗАРЕГИСТРИРОВАТЬ НС
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Критические НС" 
          value={criticalEvents.length} 
          desc="Требуют реакции" 
          icon={Siren} 
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
          className={criticalEvents.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}
          pulse={criticalEvents.length > 0}
        />
        <StatsCard 
          title="В расследовании" 
          value={activeEvents.length} 
          desc="Безопасность" 
          icon={ShieldAlert} 
          iconColor="text-primary" 
          iconBg="bg-primary/10"
        />
        <StatsCard 
          title="Активные ремонты" 
          value={myActiveRequests.length} 
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
            <div className="mb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="ns" className="truncate">Журнал событий</TabsTrigger>
                <TabsTrigger value="requests" className="truncate">Заявки</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="ns" className="space-y-3 mt-0">
               {recentEvents.length > 0 ? (
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
               {myActiveRequests.length > 0 ? (
                 <>
                    {myActiveRequests.map(req => <RequestItem key={req.id} req={req} />)}
                    
                    <Link href="/requests" className="block pt-2">
                        <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary">
                            Показать все заявки
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                 </>
               ) : (
                 <EmptyState text="Нет активных заявок" />
               )}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: ALERTS & ANNOUNCEMENTS */}
        <div className="space-y-6 min-w-0">
            
           {/* Critical Events Alert (Visible to Safety Managers) */}
           {isSafetyManager && criticalEvents.length > 0 && (
             <Card className="border-destructive/40 bg-destructive/5">
               <CardHeader className="pb-3 border-b border-destructive/10 bg-destructive/10">
                 <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                    <Siren className="h-4 w-4 animate-pulse shrink-0" />
                    <span className="truncate">Требуют разбора ({criticalEvents.length})</span>
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-0 p-0">
                 {criticalEvents.slice(0, 3).map((evt, idx) => (
                   <Link href={`/events/${evt.id}`} key={evt.id}>
                       <div className={`p-4 hover:bg-destructive/10 transition-colors cursor-pointer ${idx !== Math.min(criticalEvents.length, 3) - 1 ? 'border-b border-destructive/10' : ''}`}>
                         <div className="flex justify-between items-start mb-1 gap-2">
                           <span className="text-xs font-bold text-destructive whitespace-nowrap">{evt.code}</span>
                           <span className="text-[10px] font-medium text-destructive opacity-80 whitespace-nowrap">
                              {EVENT_SEVERITY_MAP[evt.severity] || evt.severity}
                           </span>
                         </div>
                         <p className="text-xs font-medium text-foreground line-clamp-2 break-words">
                            {/* Здесь тоже используем словарь, если он есть, иначе description как фоллбэк */}
                           {typeNamesMap[evt.typeId || ""] || evt.description}
                         </p>
                       </div>
                   </Link>
                 ))}
               </CardContent>
             </Card>
           )}

           {/* Announcements Widget */}
           <Card className="gap-0 py-0! overflow-hidden">
             <CardHeader className="p-3 pb-3! border-b bg-muted/40 space-y-0 gap-y-0 pt-3">
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <Bell className="h-4 w-4 shrink-0" />
                 Важные объявления
               </CardTitle>
             </CardHeader>
             
             <CardContent className="p-3 pt-4 pb-4 space-y-4">
               {announcements.length > 0 ? (
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

// ОБНОВЛЕННЫЙ КОМПОНЕНТ КАРТОЧКИ СОБЫТИЯ
function EventItem({ evt, typeMap, catMap }: { evt: IncidentEvent, typeMap: Record<string, string>, catMap: Record<string, string> }) {
  const isCritical = evt.severity === 'critical' || evt.severity === 'severe';
  
  // Получаем названия из справочника
  const typeName = typeMap[evt.typeId || ""] || evt.typeName || evt.typeId;
  const categoryName = catMap[evt.categoryId] || evt.categoryName || evt.categoryId;

  return (
    <Link 
      href={`/events/${evt.id}`}
      className={`
        group flex items-center justify-between p-4 bg-card border rounded-xl transition-all cursor-pointer hover:shadow-md
        ${isCritical ? 'border-destructive/40 bg-destructive/5' : 'border-border'}
      `}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Иконка */}
        <div className={`
          h-10 w-10 shrink-0 rounded-full flex items-center justify-center border
          ${isCritical 
            ? 'bg-destructive/10 border-destructive/20 text-destructive' 
            : 'bg-primary/10 border-primary/20 text-primary'}
        `}>
           <AlertTriangle className="h-5 w-5" />
        </div>
        
        <div className="space-y-1 min-w-0 flex-1">
          {/* Верхняя строка: Код и Статус */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-muted-foreground whitespace-nowrap">{evt.code}</span>
            {isCritical && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1 rounded-sm whitespace-nowrap">
                  {EVENT_SEVERITY_MAP[evt.severity]}
              </Badge>
            )}
          </div>
          
          {/* Средняя строка: ТИП СОБЫТИЯ (Вместо описания) */}
          <h4 className="font-bold text-sm text-foreground line-clamp-1 break-all transition-colors group-hover:text-primary">
            {typeName}
          </h4>
          
          {/* Нижняя строка: Категория и Дата */}
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
  const typeLabel = SERVICE_TYPE_CONFIG[req.type]?.label || req.type;
  
  return (
    <Link 
      href={`/requests/${req.id}`}
      className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl transition-all cursor-pointer hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
           {req.type.includes('med') ? <Activity className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
             <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">#{req.number}</span>
             <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 rounded-sm whitespace-nowrap">
                {typeLabel}
             </span>
          </div>
          
          <h4 className="font-medium text-sm text-foreground line-clamp-1 opacity-90 transition-colors group-hover:opacity-100 group-hover:text-primary break-all">
            {req.description}
          </h4>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
         <Badge variant="outline" className={`shadow-none border-0 whitespace-nowrap ${getBadgeColor(req.status)}`}>
             {STATUS_MAP[req.status]}
         </Badge>
         
         <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-primary" />
      </div>
    </Link>
  )
}

function StatsCard({ title, value, desc, icon: Icon, className, pulse, iconColor, iconBg }: any) {
  return (
    <Card className={`border py-2! relative overflow-hidden group transition-all ${className}`}>
      <CardContent className="p-5 flex flex-col gap-1 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${iconBg} ${iconColor} ${pulse ? 'animate-pulse' : ''}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="text-sm font-medium text-muted-foreground truncate">{title}</div>
        <div className="text-[10px] text-muted-foreground/70 truncate">{desc}</div>
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