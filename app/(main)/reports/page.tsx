"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Download,
  AlertTriangle,
  Wrench,
  FileText,
  Users,
  Activity
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { DynamicChart } from "@/components/charts/dynamic-chart";
import { DashboardStats } from "@/lib/types";
import { enrichChartData } from "@/lib/status-helper";

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/reports/stats");
        if (res.ok) {
          const rawData = await res.json();

          const enrichedStats = {
            ...rawData,
            charts: {
              ...rawData.charts,
              requestsByStatus: enrichChartData(rawData.charts.requestsByStatus),
              eventsBySeverity: enrichChartData(rawData.charts.eventsBySeverity),
              requestsByCategory: enrichChartData(rawData.charts.requestsByCategory),
            }
          };

          setStats(enrichedStats);
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">

      {/* HEADER: Виден всегда (Статичный) */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Отчеты и Аналитика</h1>
          <p className="text-muted-foreground">Сводная статистика работы клиники</p>
        </div>
        <div>
          <Button disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт (PDF)
          </Button>
        </div>
      </div>

      {isLoading || !stats ? (
        /* --- SKELETON STATE --- */
        <div className="space-y-6">
          
          {/* KPI Cards Skeleton (3 items) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card text-card-foreground p-6 space-y-8 shadow-sm">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24" /> {/* Title */}
                  <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
                </div>
                <div className="space-y-2">
                   <Skeleton className="h-8 w-16" /> {/* Value */}
                   <Skeleton className="h-3 w-24 opacity-70" /> {/* Trend */}
                </div>
              </div>
            ))}
          </div>

          <Separator className="opacity-50" />

          {/* Tabs & Charts Skeleton */}
          <div className="space-y-6">
            {/* Tabs List */}
            <Skeleton className="h-12 w-full md:w-100 rounded-lg bg-muted" />

            {/* Charts Grid (Mimics "Safety" tab structure) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Severity Pie Chart */}
              <div className="rounded-xl border bg-card p-6 space-y-4 pb-12">
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-40" /> {/* Title */}
                    <Skeleton className="h-4 w-32" /> {/* Desc */}
                 </div>
                 <div className="flex items-center justify-center py-4">
                    <Skeleton className="h-62.5 w-62.5 rounded-full" />
                 </div>
              </div>

              {/* Chart 2: Category Bar Chart */}
              <div className="rounded-xl border bg-card p-6 space-y-4 pb-12">
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-48" />
                 </div>
                 <div className="flex items-end justify-between h-62.5 gap-2 px-4 pb-2">
                    {[60, 40, 80, 50, 90, 30].map((height, idx) => (
                       <Skeleton 
                          key={idx} 
                          className="w-full rounded-t-md" 
                          style={{ height: `${height}%` }}
                       />
                    ))}
                 </div>
              </div>

              {/* Bottom Card: Critical Incidents List */}
              <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-64" />
                 </div>
                 <div className="space-y-3 pt-2">
                    {[1, 2, 3].map((i) => (
                       <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-20" />
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- REAL CONTENT --- */
        <>
          {/* KPI Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Тяжесть последствий</CardTitle>
                    <CardDescription>Классификация рисков</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DynamicChart type="pie" data={stats.charts.eventsBySeverity} height={300} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Типы инцидентов</CardTitle>
                    <CardDescription>Частота возникновения событий</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DynamicChart
                      type="bar-vertical"
                      data={stats.charts.eventsByCategory}
                      height={300}
                      color="hsl(var(--warning))"
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-l-4 border-l-destructive">
                  <CardHeader>
                    <CardTitle className="text-base text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Последние критические инциденты
                    </CardTitle>
                  </CardHeader>
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

                  <div className="h-[300px] w-full">
                    <DynamicChart
                      type="area"
                      data={stats.charts.yearlyTrend}
                      dataKey="requests"
                      categoryKey="name"
                      color="hsl(var(--primary))"
                      height={300}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </>
      )}
    </div>
  );
}

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