"use client";

import React, { useState } from "react";
import { 
  FileDown, 
  Printer, 
  Filter, 
  Calendar, 
  BarChart3, 
  PieChart,
  Download,
  Clock,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartsView } from "./charts-view";
import { getStatusColor } from "@/lib/status-helper";

// Мок-данные
const REPORT_DATA = [
  { id: "evt_1", type: "Падение пациента", category: "Безопасность", date: "24.11.2025", status: "В работе", department: "Терапия", duration: "2ч 15м" },
  { id: "evt_2", type: "Ошибка в дозировке", category: "Лекарства", date: "23.11.2025", status: "Зарегистрировано", department: "Хирургия", duration: "—" },
  { id: "evt_3", type: "Сбой инфузомата", category: "Оборудование", date: "22.11.2025", status: "Выполнено", department: "Реанимация", duration: "45м" },
  { id: "evt_4", type: "Утеря анализов", category: "Документация", date: "22.11.2025", status: "Отказано", department: "Лаборатория", duration: "1д 2ч" },
  { id: "evt_5", type: "Падение посетителя", category: "Безопасность", date: "21.11.2025", status: "Выполнено", department: "Приемный покой", duration: "1ч 10м" },
  { id: "evt_6", type: "Сбой электропитания", category: "Инфраструктура", date: "20.11.2025", status: "Выполнено", department: "Все", duration: "30м" },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = REPORT_DATA.filter(item => 
    statusFilter === "all" || item.status === statusFilter
  );

  const total = filteredData.length;
  const solved = filteredData.filter(i => i.status === "Выполнено").length;
  const active = filteredData.filter(i => i.status === "В работе" || i.status === "Зарегистрировано").length;

  const handleExport = (type: "excel" | "pdf") => {
    alert(`Экспорт ${type.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Аналитика и Отчеты</h1>
          <p className="text-sm text-muted-foreground">Сводная статистика по инцидентам</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => handleExport("pdf")} className="flex-1 sm:flex-none">
                <Printer className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")} className="flex-1 sm:flex-none">
                <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
        </div>
      </div>

      {/* Блок статистики (KPI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего событий</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {total}
                    {/* Иконка может быть primary цвета */}
                    <BarChart3 className="h-4 w-4 text-primary" />
                </div>
            </CardContent>
        </Card>
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Решено / Закрыто</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-success flex items-center gap-2">
                    {solved}
                    <span className="text-xs font-normal text-muted-foreground">({total > 0 ? Math.round((solved/total)*100) : 0}%)</span>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Активные</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-warning flex items-center gap-2">
                    {active}
                    <PieChart className="h-4 w-4 text-warning" />
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <ChartsView />

      {/* ДЕТАЛЬНЫЙ ОТЧЕТ (Таблица/Карточки) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <h2 className="text-lg font-bold text-foreground">Детальный отчет</h2>
            
            {/* Фильтры */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <SelectValue placeholder="Период" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">За неделю</SelectItem>
                        <SelectItem value="month">За месяц</SelectItem>
                        <SelectItem value="year">За год</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Статус" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="Зарегистрировано">Зарегистрировано</SelectItem>
                        <SelectItem value="В работе">В работе</SelectItem>
                        <SelectItem value="Выполнено">Выполнено</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {/* ВАРИАНТ 1: ТАБЛИЦА (Только ПК - hidden md:block) */}
        <Card className="hidden md:block bg-card border-border overflow-hidden p-0">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b border-border">
                            <TableRow className="border-b border-border hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Дата</TableHead>
                                <TableHead className="text-muted-foreground">Тип события</TableHead>
                                <TableHead className="text-muted-foreground">Категория</TableHead>
                                <TableHead className="text-muted-foreground">Отделение</TableHead>
                                <TableHead className="text-muted-foreground">Длительность</TableHead>
                                <TableHead className="text-right text-muted-foreground">Статус</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row) => (
                                    <TableRow key={row.id} className="border-b border-border hover:bg-muted/50">
                                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                            {row.date}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {row.type}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {row.category}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {row.department}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {row.duration}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={`font-normal ${getStatusColor(row.status)}`}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Данных за этот период нет
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        {/* ВАРИАНТ 2: КАРТОЧКИ (Только Мобильные - md:hidden) */}
        <div className="md:hidden space-y-3">
            {filteredData.length > 0 ? (
                filteredData.map((row) => (
                    <Card key={row.id} className="bg-card border-border p-0">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-sm text-foreground line-clamp-2 mr-2">{row.type}</div>
                                <Badge variant="outline" className={`text-[10px] px-1.5 shrink-0 ${getStatusColor(row.status)}`}>
                                    {row.status}
                                </Badge>
                            </div>
                            
                            <div className="space-y-1.5">
                                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
                                    {row.category}
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {row.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {row.duration}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground/70 pt-1">
                                    {row.department}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    Нет данных
                </div>
            )}
        </div>

      </div>
    </div>
  );
}