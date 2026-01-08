"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- ДАННЫЕ ---
const DYNAMICS_DATA = [
  { name: "Пн", count: 2 },
  { name: "Вт", count: 4 },
  { name: "Ср", count: 1 },
  { name: "Чт", count: 5 },
  { name: "Пт", count: 3 },
  { name: "Сб", count: 2 },
  { name: "Вс", count: 1 },
];

const CATEGORY_DATA = [
  { name: "Безопасность", count: 12, fill: "hsl(var(--primary))" }, // Используем --primary
  { name: "Лекарства", count: 8, fill: "#8b5cf6" },
  { name: "Оборудование", count: 5, fill: "#f59e0b" },
  { name: "Документы", count: 3, fill: "#10b981" },
  { name: "Инфрастр.", count: 2, fill: "#64748b" },
];

const TOP_INCIDENTS_DATA = [
  { name: "Падение пациента", count: 10 },
  { name: "Ошибка дозировки", count: 6 },
  { name: "Сбой инфузомата", count: 4 },
  { name: "Утеря анализов", count: 3 },
  { name: "Сбой питания", count: 2 },
];

// ДЕТАЛИЗАЦИЯ
const SECURITY_TYPES = [
  { name: "Падение с кровати", count: 5, fill: "hsl(var(--primary))" },
  { name: "Падение в коридоре", count: 3, fill: "#60a5fa" },
  { name: "Ошибка идентификации", count: 2, fill: "#93c5fd" },
  { name: "Пролежни", count: 2, fill: "#bfdbfe" },
];

const MED_TYPES = [
  { name: "Неверная доза", count: 4, fill: "#8b5cf6" },
  { name: "Неверный препарат", count: 2, fill: "#a78bfa" },
  { name: "Пропуск приема", count: 1, fill: "#c4b5fd" },
  { name: "Аллергия", count: 1, fill: "#ddd6fe" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg text-xs z-50">
        <p className="font-medium text-foreground mb-1">{label || payload[0].name}</p>
        <p className="text-muted-foreground">
          Количество: <span className="font-bold text-primary">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ChartsView() {
  // Цвет для графика динамики (берем CSS переменную)
  const primaryColor = "hsl(var(--primary))"; 

  return (
    <Tabs defaultValue="general" className="space-y-6">
      
      {/* --- ИСПРАВЛЕНИЕ: Жесткий контейнер для скролла --- */}
      <div className="w-full max-w-[calc(100vw-32px)] overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <TabsList className="inline-flex w-max h-auto justify-start bg-muted p-1 border border-border">
            <TabsTrigger value="general" className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Общий обзор</TabsTrigger>
            <TabsTrigger value="security" className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Безопасность</TabsTrigger>
            <TabsTrigger value="medication" className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Лекарства</TabsTrigger>
            <TabsTrigger value="equipment" className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Оборудование</TabsTrigger>
        </TabsList>
      </div>

      {/* === ВКЛАДКА 1: ОБЩИЙ ОБЗОР === */}
      <TabsContent value="general" className="space-y-6 m-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Динамика */}
            <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Динамика</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DYNAMICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/20" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" dy={10} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: primaryColor, strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="count" stroke={primaryColor} strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Категории */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">По категориям</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CATEGORY_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/20" />
                            <XAxis dataKey="name" hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                            {CATEGORY_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4 px-4">
                        {CATEGORY_DATA.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                {item.name}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Топ-5 */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Частые события</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={TOP_INCIDENTS_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-muted/20" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            {/* Используем destructive для привлечения внимания (красный) */}
                            <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} barSize={15} className="opacity-90" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>

      {/* === ВКЛАДКА 2: БЕЗОПАСНОСТЬ === */}
      <TabsContent value="security" className="m-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Структура нарушений</CardTitle>
                    <CardDescription className="text-muted-foreground">Детализация по типам инцидентов</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={SECURITY_TYPES}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {SECURITY_TYPES.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Легенда */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {SECURITY_TYPES.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span className="text-xs font-medium text-foreground">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold text-foreground">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>

      {/* === ВКЛАДКА 3: ЛЕКАРСТВА === */}
      <TabsContent value="medication" className="m-0">
        <div className="grid grid-cols-1 gap-6">
             <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Ошибки терапии</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MED_TYPES} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/20" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" interval={0} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                {MED_TYPES.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>

      <TabsContent value="equipment" className="m-0">
          <div className="flex items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed border-border rounded-lg text-sm">
              Нет данных за этот период
          </div>
      </TabsContent>

    </Tabs>
  );
}