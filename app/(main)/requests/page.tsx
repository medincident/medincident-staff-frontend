"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import { MOCK_REQUESTS } from "@/lib/mock-data";
import { getStatusColor, getPriorityColor } from "@/lib/status-helper";
import { SERVICE_TYPES_MAP, STATUS_MAP } from "@/lib/types";

export default function RequestsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredData = MOCK_REQUESTS.filter((req) => {
    const matchesSearch = 
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.number.toString().includes(searchTerm) ||
      req.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCancel = (id: string) => {
    if (confirm(`Вы уверены, что хотите отменить заявку ${id}?`)) {
      console.log(`Заявка ${id} отменено`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Заявки на обслуживание</h1>
          <p className="text-sm text-muted-foreground">АХО, ИТ, Медтехника и другие службы</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Создать заявку
          </Button>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, описанию или кабинету..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Статус" />
                </div>
            </SelectTrigger>
            <SelectContent className="border">
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(STATUS_MAP).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
            </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <SelectValue placeholder="Приоритет" />
                </div>
            </SelectTrigger>
            <SelectContent className="border">
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="normal">Обычный</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
                <SelectItem value="critical">Критический</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      {/* ТАБЛИЦА (ПК) */}
      <div className="hidden md:block bg-card rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] text-muted-foreground">Номер</TableHead>
              <TableHead className="text-muted-foreground">Тип / Описание</TableHead>
              <TableHead className="text-muted-foreground">Место</TableHead>
              <TableHead className="text-muted-foreground">Приоритет</TableHead>
              <TableHead className="text-muted-foreground">Статус</TableHead>
              <TableHead className="text-center text-muted-foreground">Дата</TableHead>
              <TableHead className="text-right text-muted-foreground">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((req) => (
                <TableRow key={req.id} className="border-b hover:bg-muted/50">
                  <TableCell className="font-mono font-medium text-xs text-muted-foreground">
                    #{req.number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{SERVICE_TYPES_MAP[req.type]}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]" title={req.description}>
                            {req.description}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {req.location}
                  </TableCell>
                  <TableCell>
                    {/* Исправленный бейдж для таблицы */}
                    <Badge variant="outline" className={`font-normal text-[10px] whitespace-nowrap ${getPriorityColor(req.priority)}`}>
                      {req.priority === 'critical' ? 'Критичный' : req.priority === 'urgent' ? 'Срочно' : 'Обычный'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`whitespace-nowrap ${getStatusColor(req.status)}`}>
                      {STATUS_MAP[req.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border w-48">
                        <Link href={`/requests/${req.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Просмотреть
                            </DropdownMenuItem>
                        </Link>
                        <Link href={`/requests/${req.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleCancel(req.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Отменить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Заявки не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* КАРТОЧКИ (Мобильные) */}
      <div className="md:hidden space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((req) => (
            <div key={req.id} className="relative group">
                <Link href={`/requests/${req.id}`} className="block">
                    <Card className={`
                        relative overflow-hidden transition-all active:scale-[0.99] border p-0 gap-0 bg-card
                        ${req.status === 'in_work' ? 'border-l-warning border-l-4' : ''}
                        ${req.status === 'created' ? 'border-l-muted-foreground border-l-4' : ''}
                        ${req.status === 'completed' ? 'border-l-success border-l-4' : ''}
                        ${req.status === 'refused' ? 'border-l-destructive border-l-4' : ''}
                    `}>
                        {/* ВЕРХНЯЯ ЧАСТЬ: С отступом справа под кнопку меню */}
                        <div className="pt-3 px-3 pr-10 pb-2"> 
                            
                            <div className="mb-2">
                                <h3 className="font-semibold text-foreground text-sm leading-tight">
                                    {SERVICE_TYPES_MAP[req.type]}
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className={`
                                    text-[10px] h-5 px-1.5 whitespace-nowrap shrink-0 border
                                    ${getStatusColor(req.status)}
                                `}>
                                    {STATUS_MAP[req.status]}
                                </Badge>
                                
                                <Badge variant="outline" className={`
                                    text-[10px] h-5 px-1.5 whitespace-nowrap shrink-0 border
                                    ${getPriorityColor(req.priority)}
                                `}>
                                    {req.priority === 'critical' ? '⚡ Критичный' : req.priority === 'urgent' ? 'Срочно' : 'Обычный'}
                                </Badge>
                            </div>

                            <div className="mb-1 space-y-1.5">
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {req.description}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{req.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* НИЖНЯЯ ЧАСТЬ (ФУТЕР): На всю ширину, без pr-10 */}
                        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/5 mt-1">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                                <span className="font-bold">#{req.number}</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                    </Card>
                </Link>

                {/* Кнопка меню (абсолютное позиционирование) */}
                <div className="absolute top-1 right-1 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                             <Link href={`/requests/${req.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Просмотреть
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`/requests/${req.id}/edit`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Редактировать
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel(req.id);
                                }}
                            >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Отменить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          ))
        ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-card rounded-lg border border-dashed">
                <Search className="h-8 w-8 mb-2 opacity-20" />
                <span className="text-sm">Заявки не найдены</span>
            </div>
        )}
      </div>
    </div>
  );
}