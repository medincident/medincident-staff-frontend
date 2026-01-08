"use client";

import { 
  TrendingUp, 
  Download, 
  Printer, 
  AlertTriangle, 
  Wrench, 
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Импортируем компонент графика (который мы создали ранее)
import { DynamicChart } from "@/components/charts/dynamic-chart";

// Импортируем данные и справочники
import { 
  MOCK_REQUESTS, 
  MOCK_EVENTS, 
  SEVERITY_MAP, 
  SERVICE_TYPES_MAP, 
  STATUS_MAP 
} from "@/lib/mock-data";

export default function ReportsPage() {
  
  // --- ПОДГОТОВКА ДАННЫХ (АГРЕГАЦИЯ) ---

  // 1. Статус заявок (Сколько в работе, сколько выполнено)
  const requestsByStatus = Object.values(
    MOCK_REQUESTS.reduce((acc: any, curr) => {
      const label = STATUS_MAP[curr.status] || curr.status;
      acc[curr.status] = acc[curr.status] || { name: label, value: 0 };
      acc[curr.status].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  // 2. Заявки по Категориям (Сантехника, ИТ и т.д.)
  const requestsByCategory = Object.values(
    MOCK_REQUESTS.reduce((acc: any, curr) => {
      // Если категорию добавил врач вручную и ее нет в мапе, используем ключ как есть
      const label = SERVICE_TYPES_MAP[curr.type] || curr.type;
      acc[label] = acc[label] || { name: label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  // 3. НС по Тяжести (Pie Chart)
  const eventsBySeverity = Object.values(
    MOCK_EVENTS.reduce((acc: any, curr) => {
      const label = SEVERITY_MAP[curr.severity] || curr.severity;
      acc[label] = acc[label] || { name: label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];

  // 4. НС по Категориям (Падение, Лекарства и т.д.)
  const eventsByCategory = Object.values(
    MOCK_EVENTS.reduce((acc: any, curr) => {
      const label = curr.category; // Тут предполагаем, что name уже человекочитаемый или есть мап
      acc[label] = acc[label] || { name: label, value: 0 };
      acc[label].value += 1;
      return acc;
    }, {})
  ) as { name: string; value: number }[];


  // KPI Подсчеты
  const totalRequests = MOCK_REQUESTS.length;
  const activeRequests = MOCK_REQUESTS.filter(r => r.status === 'in_work' || r.status === 'created').length;
  const totalEvents = MOCK_EVENTS.length;
  const criticalEvents = MOCK_EVENTS.filter(e => e.severity === 'critical' || e.severity === 'severe').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 print:p-0 print:pb-0">
      
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Отчеты и Аналитика</h1>
          <p className="text-muted-foreground">Сводная статистика по клинике</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Печать
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Экспорт (PDF)
          </Button>
        </div>
      </div>

      {/* Верхние KPI карточки (Общие) */}
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
          className="bg-blue-50 border-blue-200 dark:bg-blue-900/20"
        />
        <KPICard 
          title="Инциденты (НС)" 
          value={totalEvents} 
          trend="Всего за период" 
          icon={AlertTriangle} 
          className="bg-orange-50 border-orange-200 dark:bg-orange-900/20"
        />
        <KPICard 
          title="Критические НС" 
          value={criticalEvents} 
          trend="Требуют разбора" 
          icon={TrendingUp} 
          iconColor="text-red-600"
        />
      </div>

      <Separator className="print:hidden" />

      {/* Основные вкладки */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px] print:hidden">
          <TabsTrigger value="requests">Технические службы</TabsTrigger>
          <TabsTrigger value="safety">Безопасность (НС)</TabsTrigger>
          <TabsTrigger value="summary">Сводка для руководства</TabsTrigger>
        </TabsList>

        {/* 1. ВКЛАДКА ТЕХНИЧЕСКИЕ СЛУЖБЫ */}
        <TabsContent value="requests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="print:shadow-none print:border-none">
              <CardHeader>
                <CardTitle>Распределение по службам</CardTitle>
                <CardDescription>Какие отделы загружены больше всего</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="bar" data={requestsByCategory} height={350} />
              </CardContent>
            </Card>

            <Card className="print:shadow-none print:border-none">
              <CardHeader>
                <CardTitle>Статусы выполнения</CardTitle>
                <CardDescription>Эффективность обработки заявок</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="pie" data={requestsByStatus} height={350} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. ВКЛАДКА БЕЗОПАСНОСТЬ (НС) */}
        <TabsContent value="safety" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Тяжесть последствий</CardTitle>
                <CardDescription>Классификация рисков</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="pie" data={eventsBySeverity} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Типы инцидентов</CardTitle>
                <CardDescription>Частота возникновения событий</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicChart type="bar" data={eventsByCategory} height={300} />
              </CardContent>
            </Card>

            {/* Таблица последних критических событий */}
            <Card className="lg:col-span-2">
              <CardHeader>
                 <CardTitle className="text-base text-red-600">Журнал критических событий</CardTitle>
              </CardHeader>
              <CardContent>
                 {MOCK_EVENTS.filter(e => e.severity === 'critical' || e.severity === 'severe' || e.severity === 'moderate').length > 0 ? (
                   <div className="space-y-2">
                     {MOCK_EVENTS.filter(e => e.severity === 'critical' || e.severity === 'severe' || e.severity === 'moderate').map(evt => (
                       <div key={evt.id} className="flex justify-between items-center p-3 border rounded-md bg-muted/20">
                          <div>
                            <div className="font-medium text-sm">{evt.description}</div>
                            <div className="text-xs text-muted-foreground">{evt.location} • {new Date(evt.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                            {SEVERITY_MAP[evt.severity]}
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-4 text-muted-foreground">Критических инцидентов не зафиксировано</div>
                 )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* 3. ВКЛАДКА СВОДКА (Для Гостей и Директора) */}
        <TabsContent value="summary" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Эффективность работы учреждения</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="h-[200px] flex items-center justify-center border-dashed border-2 rounded-lg bg-muted/10">
                 <p className="text-muted-foreground">Здесь можно разместить общий график динамики (LineChart) за год</p>
               </div>
               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-700">98%</div>
                    <div className="text-xs text-green-800 uppercase font-bold mt-1">Заявок закрыто в срок</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-700">2.4 ч</div>
                    <div className="text-xs text-blue-800 uppercase font-bold mt-1">Среднее время реакции</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-700">0</div>
                    <div className="text-xs text-purple-800 uppercase font-bold mt-1">Травматизм персонала</div>
                  </div>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

// Вспомогательный компонент для карточек KPI
function KPICard({ title, value, trend, icon: Icon, className, iconColor }: any) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  )
}