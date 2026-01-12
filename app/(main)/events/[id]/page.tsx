"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, CheckCircle2, FileText, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Используем новые хелперы
import { getStatusColor } from "@/lib/status-helper";
import { STATUS_MAP, RequestStatus } from "@/lib/types";
import { ChatSection, ChatMessage } from "@/components/ui/chat-section";

const MOCK_EVENT = {
  id: "evt_123",
  category: "Безопасность пациента",
  type: "Падение пациента",
  status: "in_work", // Правильный ключ статуса
  place: "Палата №205, Терапевтическое отделение",
  description: "Пациент попытался встать без посторонней помощи и упал возле кровати. Видимых повреждений нет, жалобы на боль в колене. Осмотрен дежурным врачом.",
  author: "Иванов И.И. (Медбрат)",
  createdAt: "24.11.2025 10:30",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, sender: "System", text: "Событие создано. Ожидает назначения ответственного.", time: "10:30", isSystem: true },
  { id: 2, sender: "Петрова А.В.", role: "Ответственный", text: "Добрый день. Был ли поднят бортик кровати в момент падения?", time: "10:50", isMe: false },
  { id: 3, sender: "Иванов И.И.", role: "Вы", text: "Нет, бортик был опущен, так как проводились процедуры за 10 минут до этого.", time: "10:55", isMe: true },
];

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  // Приводим статус к типу RequestStatus для безопасности типов
  const [status, setStatus] = useState<RequestStatus>(MOCK_EVENT.status as RequestStatus);

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now(),
      sender: "Иванов И.И.",
      role: "Вы",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, msg]);
  };

  const DetailsSection = () => (
    <div className="space-y-6">
       <Card className="gap-3 bg-card border">
            <CardHeader>
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                    {MOCK_EVENT.category}
                </div>
                <CardTitle className="text-lg text-foreground">{MOCK_EVENT.type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{MOCK_EVENT.place}</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Описание ситуации</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {MOCK_EVENT.description}
                    </p>
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    Автор: {MOCK_EVENT.author}
                </div>
            </CardContent>
        </Card>

        {/* Карточка управления статусом (обновленная) */}
        <Card className="border-primary/20 bg-primary/5 gap-1">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Управление статусом
                </CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Select value={status} onValueChange={(val) => setStatus(val as RequestStatus)}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-background border-input text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="shadow-none border">
                            {/* Используем общий маппинг статусов */}
                            {Object.entries(STATUS_MAP).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                        Измените статус, если работа по инциденту завершена
                    </span>
                    </div>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] md:h-auto flex flex-col pb-20 md:pb-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Событие #{id}
                <Badge variant="outline" className={`shadow-none ${getStatusColor(status)}`}>
                    {STATUS_MAP[status] || status}
                </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">Создано {MOCK_EVENT.createdAt}</p>
        </div>
      </div>

      {/* MOBILE VIEW */}
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
                    title="Обсуждение инцидента"
                />
            </TabsContent>
        </Tabs>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="col-span-2 overflow-y-auto pr-1 pb-4">
            <DetailsSection />
        </div>
        <div className="col-span-1 h-[600px]">
            <ChatSection 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                title="Обсуждение инцидента"
            />
        </div>
      </div>
    </div>
  );
}