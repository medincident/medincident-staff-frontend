"use client";

import Link from "next/link";
import { 
  AlertTriangle, 
  Wrench, 
  Activity, 
  CheckCircle2, 
  ArrowUpRight,
  Briefcase,
  Bell,
  CalendarDays,
  Siren,
  ShieldAlert,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { MOCK_USER, MOCK_REQUESTS, MOCK_EVENTS, SEVERITY_MAP } from "@/lib/mock-data";
import { getStatusColor } from "@/lib/status-helper";
import { SERVICE_TYPES_MAP, STATUS_MAP, UserRole } from "@/lib/types";

export default function DashboardPage() {
  const user = MOCK_USER;

  const activeEvents = MOCK_EVENTS.filter(e => e.status !== 'closed');
  const criticalEvents = activeEvents.filter(e => e.severity === 'critical' || e.severity === 'severe');
  const recentEvents = MOCK_EVENTS.slice(0, 5);
  const myActiveRequests = MOCK_REQUESTS
    .filter(r => r.status !== 'completed' && r.status !== 'cancelled')
    .slice(0, 5);
  const isSafetyManager = user.role === 'dispatcher_ns' || user.role === 'admin_org' || user.role === 'head_clinic';

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      
      {/* 1. ШАПКА */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
            Ситуационный центр
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground mt-1 text-sm">
             <span className="flex items-center gap-1 whitespace-nowrap">
               <Briefcase className="h-3.5 w-3.5" />
               {getRoleName(user.role)}
             </span>
             <span className="text-border">|</span>
             <span className="flex items-center gap-1 whitespace-nowrap">
               <CalendarDays className="h-3.5 w-3.5" />
               {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
             </span>
          </div>
        </div>

        {/* КНОПКИ ДЕЙСТВИЙ */}
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

      {/* 2. KPI: Карточки */}
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

      {/* 3. КОНТЕНТ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="xl:col-span-2 space-y-6 min-w-0">
          <Tabs defaultValue="ns" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <TabsList className="grid grid-cols-2 w-full sm:w-[320px]">
                <TabsTrigger value="ns" className="truncate">Журнал событий</TabsTrigger>
                <TabsTrigger value="requests" className="truncate">Заявки</TabsTrigger>
              </TabsList>
              <Link href="/events" className="hidden sm:flex text-xs font-medium text-muted-foreground hover:text-primary items-center transition-colors whitespace-nowrap">
                Открыть архив <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            <TabsContent value="ns" className="space-y-3 mt-0">
               {recentEvents.length > 0 ? (
                 recentEvents.map(evt => <EventItem key={evt.id} evt={evt} />)
               ) : (
                 <EmptyState text="Инцидентов не зафиксировано" icon={CheckCircle2} />
               )}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-3 mt-0">
               {myActiveRequests.length > 0 ? (
                 myActiveRequests.map(req => <RequestItem key={req.id} req={req} />)
               ) : (
                 <EmptyState text="Нет активных заявок" />
               )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="space-y-6 min-w-0">
           
           {/* Блок Критических */}
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
                   <div key={evt.id} className={`p-4 hover:bg-destructive/10 transition-colors cursor-pointer ${idx !== criticalEvents.length - 1 ? 'border-b border-destructive/10' : ''}`}>
                     <div className="flex justify-between items-start mb-1 gap-2">
                       <span className="text-xs font-bold text-destructive whitespace-nowrap">{evt.code}</span>
                       <span className="text-[10px] font-medium text-destructive opacity-80 whitespace-nowrap">
                          {SEVERITY_MAP[evt.severity]}
                       </span>
                     </div>
                     <p className="text-xs font-medium text-foreground line-clamp-2 break-words">
                       {evt.description}
                     </p>
                   </div>
                 ))}
               </CardContent>
             </Card>
           )}

           {/* --- ОБЪЯВЛЕНИЯ --- */}
           <Card className="gap-0 py-0! overflow-hidden">
             <CardHeader className="p-3 pb-3! border-b bg-muted/40 space-y-0 gap-y-0 pt-3">
               <CardTitle className="text-sm font-medium flex items-center gap-2">
                 <Bell className="h-4 w-4 shrink-0" />
                 Важные объявления
               </CardTitle>
             </CardHeader>
             
             <CardContent className="p-3 pt-4 pb-4 space-y-4">
               <div className="flex gap-3 items-start relative pl-3">
                 <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary" />
                 <div className="min-w-0">
                   <p className="text-xs font-semibold truncate">Инструктаж по ТБ</p>
                   <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed wrap-break-word">
                     Всем сотрудникам пройти повторный инструктаж до конца недели.
                   </p>
                 </div>
               </div>
               <Separator />
               <div className="flex gap-3 items-start relative pl-3">
                 <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-muted-foreground" />
                 <div className="min-w-0">
                   <p className="text-xs font-semibold truncate">Обновление МИС</p>
                   <p className="text-[11px] text-muted-foreground mt-0.5 wrap-break-word">
                     Завтра с 22:00 до 23:00 система недоступна.
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}

// --- КОМПОНЕНТЫ ---
function EventItem({ evt }: any) {
  const isCritical = evt.severity === 'critical' || evt.severity === 'severe';
  
  return (
    <div className={`
      group flex items-center justify-between p-4 bg-card border rounded-xl transition-all cursor-pointer
      ${isCritical ? 'border-destructive/40 bg-destructive/5' : 'border-border'}
    `}>
      <div className="flex items-center gap-4 min-w-0">
        <div className={`
          h-10 w-10 shrink-0 rounded-full flex items-center justify-center border
          ${isCritical 
            ? 'bg-destructive/10 border-destructive/20 text-destructive' 
            : 'bg-primary/10 border-primary/20 text-primary'}
        `}>
           <AlertTriangle className="h-5 w-5" />
        </div>
        
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-muted-foreground whitespace-nowrap">{evt.code}</span>
            {isCritical && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1 rounded-sm whitespace-nowrap">
                 {SEVERITY_MAP[evt.severity]}
              </Badge>
            )}
          </div>
          
          <h4 className="font-medium text-sm text-foreground line-clamp-1 break-all transition-colors group-hover:text-primary">
            {evt.description}
          </h4>
          
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
             <span className="truncate max-w-[120px]">{evt.location}</span>
             <span className="text-border">|</span>
             <span className="whitespace-nowrap">{new Date(evt.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-colors shrink-0 ml-2 group-hover:text-primary" />
    </div>
  )
}

function RequestItem({ req }: any) {
  return (
    <div className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl transition-all cursor-pointer">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
           {req.type.includes('med') ? <Activity className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
             <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">#{req.number}</span>
             <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 rounded-sm whitespace-nowrap">{SERVICE_TYPES_MAP[req.type]}</span>
          </div>
          
          <h4 className="font-medium text-sm text-foreground line-clamp-1 opacity-90 transition-colors group-hover:opacity-100 group-hover:text-primary break-all">
            {req.description}
          </h4>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
         {/* ИСПОЛЬЗУЕМ ОБЩИЙ ХЕЛПЕР (getStatusColor) */}
         <Badge variant="outline" className={`shadow-none border-0 whitespace-nowrap ${getStatusColor(req.status)}`}>
             {STATUS_MAP[req.status]}
         </Badge>
         
         <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-primary" />
      </div>
    </div>
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

function getRoleName(role: UserRole): string {
  const map: Record<UserRole, string> = {
    worker: "Сотрудник",
    head_dept: "Руководитель отделения",
    head_clinic: "Заведующий клиникой",
    admin_org: "Администратор организации",
    admin_system: "Системный администратор",
    dispatcher_ns: "Диспетчер НС",
    dispatcher_req: "Диспетчер АХО",
    guest: "Гость"
  };
  return map[role] || "Пользователь";
}