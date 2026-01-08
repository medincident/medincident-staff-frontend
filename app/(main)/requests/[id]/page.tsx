"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, User, 
  AlertTriangle, MessageSquare, Wrench 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { MOCK_REQUESTS, MOCK_USER } from "@/lib/mock-data";
import { SERVICE_TYPES_MAP, RequestStatus } from "@/lib/types";
import { getPriorityColor } from "@/lib/status-helper";

// Имитация комментариев
const INITIAL_COMMENTS = [
  { id: 1, user: "Диспетчер", text: "Заявка принята. Передана электрикам.", time: "10:35" },
  { id: 2, user: "Петров В.В. (Электрик)", text: "Выезжаю на место, нужна стремянка.", time: "10:45" },
];

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  // Ищем заявку (в реальном app - fetch)
  const request = MOCK_REQUESTS.find(r => r.id === id) || MOCK_REQUESTS[0]; 
  
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    setComments([...comments, {
      id: Date.now(),
      user: MOCK_USER.name,
      text: newComment,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setNewComment("");
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Навигация */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Заявка #{request.number}
            <Badge className={getPriorityColor(request.priority)}>
              {request.priority === 'urgent' ? 'Срочно' : request.priority === 'critical' ? 'Авария' : 'Норма'}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Создана {new Date(request.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА: Детали */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Основная инфо */}
          <Card>
            <CardHeader>
               <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="uppercase text-xs font-bold tracking-wider mb-1">
                      {SERVICE_TYPES_MAP[request.type]}
                    </CardDescription>
                    <CardTitle className="text-lg">{request.description}</CardTitle>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                   <MapPin className="h-4 w-4 text-muted-foreground" />
                   <span className="font-medium">{request.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                   <User className="h-4 w-4 text-muted-foreground" />
                   <span>Автор: {request.authorName}</span>
                </div>
              </div>

              {/* Связь с НС */}
              {request.linkedEventId && (
                <div className="border border-orange-200 bg-orange-50 p-3 rounded-md flex items-start gap-3">
                   <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                   <div>
                     <p className="text-sm font-medium text-orange-900">Связанный инцидент безопасности</p>
                     <p className="text-xs text-orange-700">Эта работа выполняется для устранения последствий НС #{request.linkedEventId}.</p>
                     <Button variant="link" className="h-auto p-0 text-orange-800 text-xs mt-1">Перейти к событию</Button>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Чат / История */}
          <Card className="flex flex-col h-[400px]">
            <CardHeader className="py-3 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ход выполнения работ
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative">
               <ScrollArea className="h-full p-4">
                 <div className="space-y-4">
                   {/* Системное сообщение */}
                   <div className="flex justify-center">
                     <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">
                       Заявка создана {new Date(request.createdAt).toLocaleTimeString()}
                     </span>
                   </div>

                   {comments.map((comment) => (
                     <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {comment.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/40 p-3 rounded-r-xl rounded-bl-xl text-sm max-w-[85%]">
                          <div className="flex justify-between items-baseline gap-4 mb-1">
                             <span className="font-bold text-xs">{comment.user}</span>
                             <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                          </div>
                          <p>{comment.text}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
            </CardContent>
            <div className="p-3 border-t">
               <form onSubmit={handleSendComment} className="flex gap-2">
                 <Input 
                   placeholder="Написать комментарий..." 
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                 />
                 <Button type="submit" size="sm">Отпр.</Button>
               </form>
            </div>
          </Card>

        </div>

        {/* ПРАВАЯ КОЛОНКА: Управление */}
        <div className="space-y-6">
          
          {/* Панель статуса */}
          <Card className={status === 'completed' ? 'border-green-200 bg-green-50' : 'border-blue-100 bg-blue-50/50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Текущий статус</CardTitle>
            </CardHeader>
            <CardContent>
               <Select value={status} onValueChange={(v: RequestStatus) => setStatus(v)}>
                 <SelectTrigger className="w-full bg-background border-muted-foreground/20">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'in_work' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                      <SelectValue />
                   </div>
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="created">Принята</SelectItem>
                   <SelectItem value="processed">Обработана</SelectItem>
                   <SelectItem value="in_work">В работе</SelectItem>
                   <SelectItem value="purchase">Закупка запчастей</SelectItem>
                   <SelectItem value="completed">Выполнена</SelectItem>
                   <SelectItem value="refused">Отказ</SelectItem>
                 </SelectContent>
               </Select>
               
               {status === 'purchase' && (
                 <div className="mt-3 text-xs bg-white/50 p-2 rounded border border-blue-100 text-blue-800">
                   ⏳ Время выполнения приостановлено до поступления материалов.
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Исполнитель (для Диспетчера) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Исполнитель</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="text-sm">
                 <span className="text-muted-foreground block text-xs mb-1">Ответственная служба:</span>
                 <div className="font-medium flex items-center gap-2">
                   <Wrench className="h-4 w-4 text-muted-foreground" />
                   IT Отдел
                 </div>
               </div>
               <Separator />
               <div className="text-sm">
                 <span className="text-muted-foreground block text-xs mb-1">Назначенный сотрудник:</span>
                 <Select defaultValue="not_assigned">
                   <SelectTrigger className="h-8 text-xs">
                     <SelectValue placeholder="Не назначен" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="not_assigned">Не назначен</SelectItem>
                     <SelectItem value="worker_1">Петров В.В.</SelectItem>
                     <SelectItem value="worker_2">Сидоров А.А.</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </CardContent>
          </Card>

          {/* Мета-данные */}
          <Card className="bg-transparent border-none shadow-none">
             <CardContent className="p-0 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Приоритет:</span>
                  <span className="font-medium text-foreground">{request.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span>Срок реакции:</span>
                  <span>2 часа</span>
                </div>
                <div className="flex justify-between">
                  <span>Дедлайн:</span>
                  <span>26.11.2025</span>
                </div>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}