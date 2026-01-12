"use client";

import { 
  TrendingUp, 
  Download, 
  AlertTriangle, 
  Wrench, 
  FileText,
  Users,
  Activity,
  MapPin
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Компонент графика
import { DynamicChart } from "@/components/charts/dynamic-chart";

// Моки и типы
import { 
  MOCK_REQUESTS, 
  MOCK_EVENTS, 
  SEVERITY_MAP, 
  SERVICE_TYPES_MAP, 
  STATUS_MAP 
} from "@/lib/mock-data";

export default function ReportsPage() {
  
  // --- АГРЕГАЦИЯ ДАННЫХ ---
  const requestsByStatus = Object.values(
    MOCK_REQUESTS.reduce((acc: any, curr) => {
      const label = STATUS_MAP[curr.status] || curr.status;
      acc[curr.status] = acc[curr.status] || { name: label, value: 0 };
      acc[curr.status].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  const requestsByCategory = Object.values(
    MOCK_REQUESTS.reduce((acc: any, curr) => {
      const label = SERVICE_TYPES_MAP[curr.type] || curr.type;
      acc[label] = acc[label] || { name: label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  const priorityMap: Record<string, string> = {
    normal: "Обычный",
    urgent: "Срочный",
    critical: "Аварийный"
  };
  const requestsByPriority = Object.values(
    MOCK_REQUESTS.reduce((acc: any, curr) => {
      const label = priorityMap[curr.priority] || curr.priority;
      acc[curr.priority] = acc[curr.priority] || { name: label, value: 0 };
      acc[curr.priority].value += 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.value - a.value) as { name: string; value: number }[];

  const eventsBySeverity = Object.values(
    MOCK_EVENTS.reduce((acc: any, curr) => {
      const label = SEVERITY_MAP[curr.severity] || curr.severity;
      acc[label] = acc[label] || { name: label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  const eventsByCategory = Object.values(
    MOCK_EVENTS.reduce((acc: any, curr) => {
      const label = curr.category;
      acc[label] = acc[label] || { name: label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  const yearlyTrendData = [
    { name: 'Янв', requests: 45, events: 2 },
    { name: 'Фев', requests: 52, events: 3 },
    { name: 'Мар', requests: 48, events: 1 },
    { name: 'Апр', requests: 61, events: 4 },
    { name: 'Май', requests: 55, events: 2 },
    { name: 'Июн', requests: 67, events: 5 },
    { name: 'Июл', requests: 72, events: 3 },
    { name: 'Авг', requests: 65, events: 1 },
    { name: 'Сен', requests: 80, events: 6 },
    { name: 'Окт', requests: 85, events: 4 },
    { name: 'Ноя', requests: 92, events: 2 },
    { name: 'Дек', requests: 105, events: 8 },
  ];

  const totalRequests = MOCK_REQUESTS.length;
  const activeRequests = MOCK_REQUESTS.filter(r => r.status === 'in_work' || r.status === 'created').length;
  const totalEvents = MOCK_EVENTS.length;
  const criticalEvents = MOCK_EVENTS.filter(e => e.severity === 'critical' || e.severity === 'severe').length;

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Отчеты и Аналитика</h1>
          <p className="text-muted-foreground">Сводная статистика работы клиники</p>
        </div>
        <div>
          <Button className="shadow-none">
            <Download className="mr-2 h-4 w-4" />
            Экспорт (PDF)
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
          title="Всего заявок" 
          value={totalRequests} 
          trend="+12% за месяц" 
          icon={FileText} 
        />
        <KPICard 
          title="Активные ремонты" 
          value={activeRequests} 
          trend="Текущая нагрузка" 
          icon={Wrench} 
          // ИСПРАВЛЕНО: text-info вместо text-info-foreground
          className="bg-info/10 border-info/20 text-info dark:text-info"
          iconColor="text-info"
        />
        <KPICard 
          title="Инциденты (НС)" 
          value={totalEvents} 
          trend="Всего за период" 
          icon={AlertTriangle} 
          className="bg-warning/10 border-warning/20 text-warning dark:text-warning"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Критические НС" 
          value={criticalEvents} 
          trend="Требуют разбора" 
          icon={TrendingUp} 
          // ИСПРАВЛЕНО: text-destructive вместо text-destructive-foreground
          className="bg-destructive/10 border-destructive/20 text-destructive dark:text-destructive"
          iconColor="text-destructive"
        />
      </div>

      <Separator />

      {/* Табы */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted rounded-lg md:w-[600px] border">
          <TabsTrigger 
            value="requests" 
            className="text-xs sm:text-sm py-2 data-[state=active]:bg-background"
          >
            Заявки
          </TabsTrigger>
          <TabsTrigger 
            value="safety" 
            className="text-xs sm:text-sm py-2 whitespace-normal leading-tight px-1 data-[state=active]:bg-background"
          >
            Нежелательные события
          </TabsTrigger>
          <TabsTrigger 
            value="summary" 
            className="text-xs sm:text-sm py-2 data-[state=active]:bg-background"
          >
            Сводка
          </TabsTrigger>
        </TabsList>

        {/* --- 1. ВКЛАДКА ЗАЯВКИ --- */}
        <TabsContent value="requests" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Статусы заявок</CardTitle>
                <CardDescription>Воронка обработки</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="donut" data={requestsByStatus} height={300} />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>По категориям</CardTitle>
                <CardDescription>Нагрузка на отделы</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="bar" data={requestsByCategory} height={300} />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Приоритетность выполнения</CardTitle>
              <CardDescription>Распределение задач по степени срочности</CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicChart 
                type="bar-vertical" 
                data={requestsByPriority} 
                height={300} 
                color="#3b82f6" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 2. ВКЛАДКА БЕЗОПАСНОСТЬ --- */}
        <TabsContent value="safety" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Тяжесть последствий</CardTitle>
                <CardDescription>Классификация рисков</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="pie" data={eventsBySeverity} height={300} />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Типы инцидентов</CardTitle>
                <CardDescription>Частота возникновения событий</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart 
                  type="bar-vertical" 
                  data={eventsByCategory} 
                  height={300} 
                  color="#f59e0b" 
                />
              </CardContent>
            </Card>

            {/* Журнал критических */}
            <Card className="lg:col-span-2 border-l-4 border-l-destructive">
              <CardHeader>
                 <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Последние критические инциденты
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 {MOCK_EVENTS.filter(e => e.severity === 'critical' || e.severity === 'severe').length > 0 ? (
                   <div className="space-y-2">
                     {MOCK_EVENTS.filter(e => e.severity === 'critical' || e.severity === 'severe').slice(0, 3).map(evt => (
                       <div key={evt.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 border rounded-md bg-muted/20">
                         <div>
                           <div className="font-medium text-sm">{evt.description}</div>
                           <div className="text-xs text-muted-foreground">{evt.location} • {new Date(evt.createdAt).toLocaleDateString()}</div>
                         </div>
                         <div className="self-start sm:self-center px-2 py-1 rounded text-xs font-bold bg-destructive/15 text-destructive border border-destructive/20 whitespace-nowrap">
                           {SEVERITY_MAP[evt.severity]}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-4 text-muted-foreground">Критических инцидентов нет</div>
                 )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* --- 3. ВКЛАДКА СВОДКА --- */}
        <TabsContent value="summary" className="mt-4">
           <Card className="shadow-none">
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
                    data={yearlyTrendData} 
                    dataKey="requests" 
                    categoryKey="name"
                    color="#3b82f6"
                    height={300}
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SummaryStat 
                    val="98%" 
                    label="Заявок закрыто в срок" 
                    className="bg-success/10 text-success border border-success/20"
                  />
                  <SummaryStat 
                    val="2.4 ч" 
                    label="Среднее время реакции" 
                    className="bg-info/10 text-info border border-info/20"
                  />
                  <SummaryStat 
                    val="Top 1" 
                    label="Лучший сотрудник: Иванов И.И." 
                    className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    icon={Users}
                  />
               </div>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function KPICard({ title, value, trend, icon: Icon, className, iconColor }: any) {
  return (
    <Card className={`shadow-none ${className || ""}`}>
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
        <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center ${className}`}>
            {Icon && <Icon className="h-5 w-5 mb-2 opacity-70" />}
            <div className="text-3xl font-bold">{val}</div>
            <div className="text-xs uppercase font-bold mt-1 opacity-80">{label}</div>
        </div>
    )
}