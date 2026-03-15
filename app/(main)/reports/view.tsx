"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Download,
  AlertTriangle,
  Wrench,
  FileText,
  Users,
  Activity,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { DynamicChart } from "@/components/charts/dynamic-chart";
import { DashboardStats } from "@/lib/types";
import { enrichChartData } from "@/lib/status-helper";

// Импорт сервиса
import { getStats } from "@/lib/services/reports";

export function ReportsView() {
  // --- STATE ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- MEMO ---
  const enrichedCharts = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats.charts,
      requestsByStatus: enrichChartData(stats.charts.requestsByStatus),
      eventsBySeverity: enrichChartData(stats.charts.eventsBySeverity),
      requestsByCategory: enrichChartData(stats.charts.requestsByCategory),
    };
  }, [stats]);

  // --- RENDER ---
  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Отчеты и Аналитика</h1>
          <p className="text-sm text-muted-foreground">Сводная статистика работы клиники</p>
        </div>
        <div>
          <Button disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт (PDF)
          </Button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
           /* KPI SKELETONS */
           Array.from({ length: 3 }).map((_, i) => (
             <Card key={`kpi-skel-${i}`} className="border rounded-xl">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <Skeleton className="h-4 w-24" /> {/* Title */}
                 <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
               </CardHeader>
               <CardContent>
                 <Skeleton className="h-8 w-16 mb-2" /> {/* Value */}
                 <Skeleton className="h-3 w-32" /> {/* Trend */}
               </CardContent>
             </Card>
           ))
        ) : stats ? (
           <>
            <KPICard
              title="Всего заявок"
              value={stats.kpi.totalRequests}
              trend="+12% за месяц"
              icon={FileText}
            />
            <KPICard
              title="Активные ремонты"
              value={stats.kpi.activeRequests}
              trend="Текущая нагрузка"
              icon={Wrench}
              className="bg-info/10 border-info/20 text-info"
              iconColor="text-info"
            />
            <KPICard
              title="Инциденты (НС)"
              value={stats.kpi.totalEvents}
              trend="Всего за период"
              icon={AlertTriangle}
              className="bg-warning/10 border-warning/20 text-warning"
              iconColor="text-warning"
            />
           </>
        ) : null}
      </div>

      <Separator />

      {/* Analytics Tabs */}
      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto min-h-12 p-1 bg-muted rounded-lg md:w-[400px] border">
          <TabsTrigger
            value="safety"
            className="text-xs sm:text-sm h-full py-2 whitespace-normal leading-tight"
          >
            Нежелательные события
          </TabsTrigger>

          <TabsTrigger
            value="summary"
            className="text-xs sm:text-sm h-full py-2 whitespace-normal leading-tight"
          >
            Сводка
          </TabsTrigger>
        </TabsList>

        <TabsContent value="safety" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PIE CHART CARD */}
            <Card>
              <CardHeader>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ) : (
                  <>
                    <CardTitle>Тяжесть последствий</CardTitle>
                    <CardDescription>Классификация рисков</CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {isLoading ? (
                   /* Pie Chart Skeleton */
                   <div className="relative flex items-center justify-center">
                      <Skeleton className="h-[200px] w-[200px] rounded-full" />
                      {/* Legend skeleton */}
                      <div className="absolute -bottom-10 flex gap-4">
                         <Skeleton className="h-3 w-16" />
                         <Skeleton className="h-3 w-16" />
                      </div>
                   </div>
                ) : enrichedCharts ? (
                   <div className="h-[300px] w-full min-h-[300px]">
                     <DynamicChart type="pie" data={enrichedCharts.eventsBySeverity} height={300} />
                   </div>
                ) : null}
              </CardContent>
            </Card>

            {/* BAR CHART CARD */}
            <Card>
              <CardHeader>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ) : (
                  <>
                    <CardTitle>Типы инцидентов</CardTitle>
                    <CardDescription>Частота возникновения событий</CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                   /* Bar Chart Skeleton */
                   <div className="h-full flex items-end justify-around pb-4 px-2 gap-4">
                      <Skeleton className="h-[40%] w-full rounded-t-md" />
                      <Skeleton className="h-[70%] w-full rounded-t-md" />
                      <Skeleton className="h-[30%] w-full rounded-t-md" />
                      <Skeleton className="h-[50%] w-full rounded-t-md" />
                      <Skeleton className="h-[20%] w-full rounded-t-md" />
                   </div>
                ) : stats ? (
                   <div className="h-[300px] w-full min-h-[300px]">
                     <DynamicChart
                       type="bar-vertical"
                       data={stats.charts.eventsByCategory}
                       height={300}
                       color="hsl(var(--warning))"
                     />
                   </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Динамика активности за год
              </CardTitle>
              <CardDescription>Количество созданных заявок и инцидентов по месяцам</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="h-[300px] w-full min-h-[300px]">
                {isLoading ? (
                   /* Area Chart Skeleton */
                   <div className="w-full h-full space-y-4">
                      <div className="flex h-[250px] items-end gap-2">
                         {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton 
                                key={i} 
                                className="w-full rounded-t-sm" 
                                style={{ height: `${Math.random() * 60 + 20}%` }} 
                            />
                         ))}
                      </div>
                      <div className="flex justify-between">
                         <Skeleton className="h-3 w-8" />
                         <Skeleton className="h-3 w-8" />
                         <Skeleton className="h-3 w-8" />
                         <Skeleton className="h-3 w-8" />
                      </div>
                   </div>
                ) : stats ? (
                   <DynamicChart
                     type="area"
                     data={stats.charts.yearlyTrend}
                     dataKey="requests"
                     categoryKey="name"
                     color="hsl(var(--primary))"
                     height={300}
                   />
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                   /* Summary Stat Skeletons */
                   Array.from({ length: 3 }).map((_, i) => (
                     <div key={`sum-skel-${i}`} className="p-4 border rounded-xl flex flex-col items-center justify-center gap-3 h-[120px]">
                        <Skeleton className="h-8 w-8 rounded-full opacity-20" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-3 w-32" />
                     </div>
                   ))
                ) : stats ? (
                   <>
                    <SummaryStat
                      val={stats.performance.closedOnTime}
                      label="Заявок закрыто в срок"
                      className="bg-success/10 text-success border border-success/20"
                    />
                    <SummaryStat
                      val={stats.performance.avgReactionTime}
                      label="Среднее время реакции"
                      className="bg-info/10 text-info border border-info/20"
                    />
                    <SummaryStat
                      val={stats.performance.bestDepartment}
                      label="Самый эффективный отдел"
                      className="bg-purple/10 text-purple border border-purple/20"
                      icon={Users}
                    />
                   </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- SUB COMPONENTS ---
function KPICard({ title, value, trend, icon: Icon, className, iconColor }: any) {
  return (
    <Card className={`border rounded-xl overflow-hidden transition-all hover:bg-accent/5 ${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium line-clamp-1">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${iconColor || ""}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground opacity-80">{trend}</p>
      </CardContent>
    </Card>
  )
}

function SummaryStat({ val, label, className, icon: Icon }: any) {
  return (
    <div className={`p-4 rounded-xl flex flex-col items-center justify-center text-center ${className}`}>
      {Icon && <Icon className="h-5 w-5 mb-2 opacity-70" />}
      <div className="text-3xl font-bold">{val}</div>
      <div className="text-[10px] uppercase font-bold mt-1 tracking-wider opacity-80">{label}</div>
    </div>
  )
}