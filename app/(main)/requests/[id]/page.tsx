"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2,
  FileText,
  MessageSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MOCK_REQUESTS, MOCK_USER } from "@/lib/mock-data";
import { SERVICE_TYPES_MAP, RequestStatus, STATUS_MAP } from "@/lib/types";
import { getPriorityColor, getStatusColor } from "@/lib/status-helper"; // Используем общий хелпер

import { ChatSection, ChatMessage } from "@/components/ui/chat-section";

const INITIAL_COMMENTS: ChatMessage[] = [
  { id: 1, sender: "Система", text: "Заявка создана. Назначена на группу АХО.", time: "10:30", isSystem: true },
  { id: 2, sender: "Диспетчер", role: "Админ", text: "Принято. Передаю электрикам, так как проблема с проводкой.", time: "10:35", isMe: false },
  { id: 3, sender: "Петров В.В.", role: "Электрик", text: "Выезжаю на место, нужна будет стремянка.", time: "10:45", isMe: false },
];

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  
  const request = MOCK_REQUESTS.find(r => r.id === id) || MOCK_REQUESTS[0]; 

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_COMMENTS);
  const [status, setStatus] = useState<RequestStatus>(request.status);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now(),
      sender: MOCK_USER.name || "Вы",
      role: "Сотрудник",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isSystem: false
    };
    setMessages([...messages, msg]);
  };

  const DetailsSection = () => (
    <div className="space-y-6">
       
       {/* Основная карточка информации */}
       <Card className="gap-3 bg-card border">
            <CardHeader>
                <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="h-3 w-3" />
                        {SERVICE_TYPES_MAP[request.type]}
                    </div>
                    {/* Бейдж приоритета без эмодзи, используем хелпер */}
                    <Badge variant="outline" className={`shadow-none border-0 ${getPriorityColor(request.priority)}`}>
                        {request.priority === 'urgent' ? 'Срочно' : request.priority === 'critical' ? 'Критичный' : 'Обычный'}
                    </Badge>
                </div>
                <CardTitle className="text-lg text-foreground leading-snug">
                    {request.description}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-foreground bg-muted/50 p-3 rounded-lg border-0">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">{request.location}</span>
                </div>

                {request.linkedEventId && (
                    <div className="flex items-start gap-3 text-sm bg-orange-50/50 p-3 rounded-lg border border-orange-200/60 dark:bg-orange-900/10 dark:border-orange-800/30">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <div className="space-y-1">
                            <span className="font-medium text-orange-900 dark:text-orange-300 block">Связанный инцидент безопасности</span>
                            <p className="text-xs text-orange-800/80 dark:text-orange-200/70 leading-relaxed">
                                Эта работа выполняется для устранения последствий события 
                                <span className="font-mono font-bold mx-1">#{request.linkedEventId}</span>.
                            </p>
                            <Button variant="link" className="h-auto p-0 text-orange-700 dark:text-orange-400 text-xs font-semibold">
                                Перейти к событию
                            </Button>
                        </div>
                    </div>
                )}

                <Separator className="bg-border" />
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Автор: <span className="text-foreground">{request.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                         <Clock className="h-3.5 w-3.5" />
                         Срок: 24 часа
                    </div>
                </div>
            </CardContent>
       </Card>

       {/* --- КАРТОЧКА УПРАВЛЕНИЯ --- */}
       <Card className="border-primary/20 bg-primary/5 gap-1">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Управление заявкой
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Текущий статус</label>
                    <Select value={status} onValueChange={(v: RequestStatus) => setStatus(v)}>
                        <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="shadow-none border">
                            {Object.entries(STATUS_MAP).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {status === 'purchase' && (
                        // Уведомление о закупке без эмодзи
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 mt-1">
                            Время выполнения приостановлено (ожидание запчастей).
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Исполнитель</label>
                        <Select defaultValue="worker_1">
                            <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                                <SelectValue placeholder="Не назначен" />
                            </SelectTrigger>
                            <SelectContent className="shadow-none border">
                                <SelectItem value="not_assigned">Не назначен</SelectItem>
                                <SelectItem value="worker_1">Петров В.В.</SelectItem>
                                <SelectItem value="worker_2">Сидоров А.А.</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Ответственный отдел</label>
                         <div className="flex items-center h-10 px-3 rounded-md border border-primary/20 bg-background text-sm text-muted-foreground">
                            Инженерная служба
                         </div>
                    </div>
                </div>

            </CardContent>
       </Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] md:h-[650px] pb-4 md:pb-0">
      
      <div className="flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0 hover:bg-muted">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2 truncate">
                Заявка #{request.number}
                <Badge variant="outline" className={`ml-1 shrink-0 ${getStatusColor(status)}`}>
                    {STATUS_MAP[status]}
                </Badge>
            </h1>
            <p className="text-xs text-muted-foreground truncate">
                Создана {new Date(request.createdAt).toLocaleString()}
            </p>
        </div>
      </div>

      <div className="md:hidden flex-1 flex flex-col">
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 mb-4 bg-muted rounded-lg border">
                <TabsTrigger value="details" className="flex gap-2 data-[state=active]:bg-background">
                    <FileText className="h-4 w-4" /> <span>Детали</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex gap-2 data-[state=active]:bg-background">
                    <MessageSquare className="h-4 w-4" /> <span>Чат</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
                <DetailsSection />
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 h-full mt-0 overflow-hidden">
                <ChatSection 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    title="Ход работ"
                />
            </TabsContent>
        </Tabs>
    </div>

      <div className="hidden md:grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="col-span-2 overflow-y-auto pr-2 pb-2 scrollbar-thin">
            <DetailsSection />
        </div>
        
        <div className="col-span-1 h-full min-h-0">
            <ChatSection 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                title="Ход работ"
            />
        </div>
      </div>
      
    </div>
  );
}