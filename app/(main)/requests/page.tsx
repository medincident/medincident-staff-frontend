"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import { MOCK_REQUESTS } from "@/lib/mock-data";
import { getRequestStatusColor, getPriorityColor } from "@/lib/status-helper";
import { SERVICE_TYPES_MAP, STATUS_MAP } from "@/lib/types";

export default function RequestsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Фильтрация
  const filteredData = MOCK_REQUESTS.filter((req) => {
    const matchesSearch = 
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.number.toString().includes(searchTerm) ||
      req.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Заголовок и кнопка */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Заявки на обслуживание</h1>
          <p className="text-sm text-muted-foreground">АХО, ИТ, Медтехника и другие службы</p>
        </div>
        <Link href="/requests/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Создать заявку
          </Button>
        </Link>
      </div>

      {/* Панель фильтров */}
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
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(STATUS_MAP).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все приоритеты</SelectItem>
              <SelectItem value="normal">Обычный</SelectItem>
              <SelectItem value="urgent">Срочный</SelectItem>
              <SelectItem value="critical">Критический</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ТАБЛИЦА (Desktop) */}
      <div className="hidden md:block bg-card rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">№</TableHead>
              <TableHead>Тип / Описание</TableHead>
              <TableHead>Место</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead className="text-right">Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((req) => (
                <TableRow key={req.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">
                    <Link href={`/requests/${req.id}`} className="hover:underline">
                      {req.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/requests/${req.id}`} className="block">
                      <div className="font-medium text-foreground">{SERVICE_TYPES_MAP[req.type]}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]" title={req.description}>
                        {req.description}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{req.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-normal ${getPriorityColor(req.priority)}`}>
                      {req.priority === 'critical' ? 'Авария' : req.priority === 'urgent' ? 'Срочно' : 'Обычный'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRequestStatusColor(req.status)}>
                      {STATUS_MAP[req.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{req.authorName}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
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

      {/* КАРТОЧКИ (Mobile) */}
      <div className="md:hidden space-y-3">
        {filteredData.map((req) => (
          <Link href={`/requests/${req.id}`} key={req.id}>
            <Card className="p-4 active:scale-[0.99] transition-transform">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">#{req.number}</span>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                    {SERVICE_TYPES_MAP[req.type]}
                  </Badge>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1.5 ${getPriorityColor(req.priority)}`}>
                   {req.priority === 'critical' ? '!!!' : req.priority === 'urgent' ? '!' : 'Norm'}
                </Badge>
              </div>
              
              <p className="text-sm font-medium line-clamp-2 mb-3">{req.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                 <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {req.location}
                 </div>
                 <Badge variant="outline" className={getRequestStatusColor(req.status)}>
                    {STATUS_MAP[req.status]}
                 </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>

    </div>
  );
}