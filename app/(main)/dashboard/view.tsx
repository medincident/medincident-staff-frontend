"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  Clock,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { STATUS_MAP } from "@/lib/constants";
import { useMyEmployee } from "@/lib/auth/use-my-employee";
import { useMyIdentity } from "@/lib/auth/use-my-identity";
import { getBadgeColor } from "@/lib/status-helper";

import {
  IncidentQueryService,
  ServiceRequestQueryService,
  AnnouncementQueryService,
  IncidentClassifierQueryService,
  v1IncidentView,
  v1ServiceRequest,
  v1AnnouncementView,
  v1Category
} from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";

const safeDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Недавно";
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

export function DashboardView() {
  const { data: session } = useSession();
  const { orgId, isResolving } = useActiveOrgId();
  const { employee } = useMyEmployee();

  const user = session?.user as any;
  const { identity } = useMyIdentity();
  const isSystemAdmin = !!identity?.isSystemAdmin;

  // Что писать в подзаголовке: должность из employee_card → fallback
  // системный админ → fallback "Сотрудник".
  const roleLabel = employee?.position
    ? employee.position
    : isSystemAdmin
      ? "Системный администратор"
      : "Сотрудник";
  const [events, setEvents] = useState<v1IncidentView[]>([]);
  const [requests, setRequests] = useState<v1ServiceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<v1AnnouncementView[]>([]);
  const [classifier, setClassifier] = useState<v1Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isResolving) return;
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [eventsRes, reqsRes, annRes, classRes] = await Promise.all([
          IncidentQueryService.incidentQueryListIncidents(orgId, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 50),
          ServiceRequestQueryService.serviceRequestQueryListServiceRequests(orgId, 50),
          AnnouncementQueryService.announcementQueryListAnnouncementsForOrganization(orgId, false, 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED', 10),
          IncidentClassifierQueryService.incidentClassifierQueryListCategoriesByOrganization(orgId, 100),
        ]);

        if (eventsRes && "items" in eventsRes && eventsRes.items) setEvents(eventsRes.items);
        if (reqsRes && "items" in reqsRes && reqsRes.items) setRequests(reqsRes.items);
        if (annRes && "items" in annRes && annRes.items) setAnnouncements(annRes.items);
        if (classRes && "items" in classRes && classRes.items) setClassifier(classRes.items);
      } catch (error) {
        console.error("Dashboard data load failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orgId, isResolving]);
  
  const categoryNamesMap = useMemo(() => {
    const cats: Record<string, string> = {};
    classifier.forEach((cat) => {
      if (cat.id && cat.name) cats[cat.id] = cat.name;
    });
    return cats;
  }, [classifier]);

  // FIXME: Active items logic based on actual status enums
  const activeEvents = events.filter(e => {
      const s = (e.status || "").toLowerCase();
      return !s.includes("closed") && !s.includes("completed");
  });
  
  const activeRequests = requests.filter(r => {
      const s = (r.status || "").toLowerCase();
      return !s.includes("completed") && !s.includes("cancelled") && !s.includes("refused");
  });
  
  const recentEvents = events.slice(0, 3);
  const myActiveRequests = activeRequests.slice(0, 3);

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border min-w-0">
        <div className="w-full md:w-auto min-w-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tight line-clamp-2 break-words">
            Ситуационный центр
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground mt-1 text-sm">
            <span className="flex items-center gap-1 min-w-0">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {isLoading ? <Skeleton className="h-4 w-24" /> : (user ? roleLabel : "Гость")}
              </span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1 min-w-0">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </span>
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
            <Button className="w-full h-12 px-6 text-base font-bold transition-all">
              <Siren className="mr-2 h-5 w-5 animate-pulse" />
              ЗАРЕГИСТРИРОВАТЬ НС
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="В расследовании (НС)"
          value={isLoading ? <Skeleton className="h-8 w-12" /> : activeEvents.length}
          desc="Требуют внимания"
          icon={ShieldAlert}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        
        <StatsCard
          title="Активные заявки"
          value={isLoading ? <Skeleton className="h-8 w-12" /> : activeRequests.length}
          desc="Всего в системе"
          icon={FileText}
          iconColor="text-info"
          iconBg="bg-info/10"
        />

        <StatsCard
          title="Всего в работе"
          value={isLoading ? <Skeleton className="h-8 w-12" /> : requests.filter(r => (r.status || "").toLowerCase().includes("in_work")).length}
          desc="Выполняются сейчас"
          icon={Wrench}
          iconColor="text-muted-foreground"
          iconBg="bg-muted"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 space-y-6 min-w-0">
          <Tabs defaultValue="ns" className="w-full">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <h2 className="text-lg font-semibold text-foreground">Журнал событий</h2>
              </div>
              
              <TabsList className="flex w-full p-1 bg-muted rounded-lg mb-4 min-w-0">
                <TabsTrigger value="ns" className="flex-1 min-w-0 truncate">События (НС)</TabsTrigger>
                <TabsTrigger value="requests" className="flex-1 min-w-0 truncate">Заявки</TabsTrigger>
              </TabsList> 
             
            </div>

            <TabsContent value="ns" className="space-y-3 mt-0">
              {isLoading ? (
                 Array.from({ length: 3 }).map((_, i) => (
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
              {isLoading ? (
                 Array.from({ length: 3 }).map((_, i) => (
                    <div key={`req-skel-${i}`} className="flex gap-4 p-4 border rounded-xl bg-card">
                       <Skeleton className="h-10 w-10 rounded-md" />
                       <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                       </div>
                    </div>
                 ))
              ) : myActiveRequests.length > 0 ? (
                <>
                  {myActiveRequests.map(req => {
                    const reqStatus = (req.status || "").toLowerCase().replace("service_request_status_", "");
                    return (
                        <Link 
                        key={req.id} 
                        href={`/requests/${req.id}`}
                        className="group flex items-center justify-between p-4 bg-card border rounded-xl transition-all cursor-pointer border-border hover:border-primary/50"
                        >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                            <Wrench className="h-5 w-5" />
                            </div>
                            <div className="space-y-1.5 min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                Заявка #{req.id?.substring(0,8)}
                            </h4>
                            
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {req.description}
                            </p>

                            <div className="text-xs text-muted-foreground flex items-center gap-2 pt-0.5">
                                <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>{safeDate(req.createdAt)}</span>
                                </div>
                                <Badge variant="outline" className={`font-medium text-[9px] h-4 px-1.5 ${getBadgeColor(reqStatus as any)}`}>
                                    {STATUS_MAP[reqStatus as any] || req.status}
                                </Badge>
                            </div>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-colors shrink-0 ml-2 group-hover:text-primary" />
                        </Link>
                    )
                  })}
                  <Link href="/requests" className="block pt-2">
                    <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary">
                      Перейти ко всем заявкам
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <EmptyState text="Активных заявок нет" icon={Wrench} />
              )}
            </TabsContent>
           
          </Tabs>
        </div>

        <div className="space-y-6 min-w-0">
          <Card className="gap-0 py-0! overflow-hidden">
            <CardHeader className="p-3 pb-3! border-b bg-muted/40 space-y-0 gap-y-0 pt-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 shrink-0" />
                Важные объявления
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 pt-4 pb-4 space-y-4">
              {isLoading ? (
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
                      <div className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 ${item.priority === 'ANNOUNCEMENT_PRIORITY_HIGH' ? 'bg-primary' : 'bg-muted-foreground'}`} />
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

function EventItem({ evt, catMap }: { evt: v1IncidentView; catMap: Record<string, string> }) {
  const typeName = evt.typeId || "Неизвестный тип";
  const categoryName = catMap[evt.categoryId || ""] || evt.categoryId || "Неизвестная категория";

  return (
    <Link
      href={`/events/${evt.id}`}
      className="group flex items-center justify-between p-4 bg-card border rounded-xl transition-all cursor-pointer border-border hover:border-primary/50"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center border bg-primary/10 border-primary/20 text-primary">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-muted-foreground whitespace-nowrap">#{evt.id?.substring(0,8)}</span>
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