"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  User, 
  CheckCircle2,
  MessageSquare,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusColor } from "@/lib/status-helper";

// Mock Data
const MOCK_EVENT = {
  id: "evt_123",
  category: "Безопасность пациента",
  type: "Падение пациента",
  status: "В работе",
  place: "Палата №205, Терапевтическое отделение",
  description: "Пациент попытался встать без посторонней помощи и упал возле кровати. Видимых повреждений нет, жалобы на боль в колене. Осмотрен дежурным врачом.",
  author: "Иванов И.И. (Медбрат)",
  createdAt: "24.11.2025 10:30",
};

const INITIAL_MESSAGES = [
  { id: 1, sender: "System", text: "Событие создано. Ожидает назначения ответственного.", time: "10:30", isSystem: true },
  { id: 2, sender: "Петрова А.В.", role: "Ответственный", text: "Добрый день. Был ли поднят бортик кровати в момент падения?", time: "10:50", isMe: false },
  { id: 3, sender: "Иванов И.И.", role: "Вы", text: "Нет, бортик был опущен, так как проводились процедуры за 10 минут до этого.", time: "10:55", isMe: true },
];

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState(MOCK_EVENT.status);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: "Иванов И.И.",
      role: "Вы",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const DetailsSection = () => (
    <div className="space-y-6">
       {/* ИСПРАВЛЕНО: Используем bg-card и border-border */}
       <Card className="gap-3 bg-card border-border">
            <CardHeader>
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                    {MOCK_EVENT.category}
                </div>
                <CardTitle className="text-lg text-foreground">{MOCK_EVENT.type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* ИСПРАВЛЕНО: bg-muted/50 для блока локации */}
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

        {/* ИСПРАВЛЕНО: Карточка статуса использует primary/5 (легкий оттенок бренда) */}
        <Card className="border-primary/20 bg-primary/5 gap-1">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Управление статусом
                </CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-background border-input text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Зарегистрировано">Зарегистрировано</SelectItem>
                            <SelectItem value="В работе">В работе</SelectItem>
                            <SelectItem value="Выполнено">Выполнено</SelectItem>
                            <SelectItem value="Отказано">Отказано</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                        Измените статус, если работа завершена
                    </span>
                    </div>
            </CardContent>
        </Card>
    </div>
  );

  // Component for Chat Section
  const ChatSection = () => (
    <Card className="flex flex-col h-[calc(100vh-280px)] md:h-[600px] border-border shadow-md p-0 gap-0 overflow-hidden bg-card">
        <CardHeader className="py-3 border-b bg-muted/50 border-border gap-0.5 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                Обсуждение инцидента
                <span className="ml-auto bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                    {messages.filter(m => !m.isSystem).length}
                </span>
            </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden relative">
            <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                            {msg.isSystem ? (
                                <div className="w-full flex justify-center my-2">
                                    <span className="text-[10px] bg-muted text-muted-foreground px-3 py-1 rounded-full">
                                        {msg.text}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Avatar className="h-8 w-8 border border-border shrink-0">
                                        <AvatarFallback className={msg.isMe ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
                                            {msg.sender[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex flex-col max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm break-words ${
                                            msg.isMe 
                                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                : 'bg-card border border-border text-foreground rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                            {msg.sender} • {msg.time}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                        <div ref={scrollRef} />
                </div>
            </ScrollArea>
        </CardContent>

        <CardFooter className="p-3 border-t bg-card border-border">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Input 
                    placeholder="Написать сообщение..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    // ИСПРАВЛЕНО: bg-background для поля ввода
                    className="flex-1 bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
                <Button size="icon" type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] md:h-auto flex flex-col pb-20 md:pb-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Событие #{id}
                <Badge variant="outline" className={getStatusColor(status)}>
                    {status}
                </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">Создано {MOCK_EVENT.createdAt}</p>
        </div>
      </div>

      {/* MOBILE VIEW (Tabs) */}
      <div className="md:hidden flex-1 flex flex-col">
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
            {/* ИСПРАВЛЕНО: bg-muted для фона вкладок */}
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 mb-4 bg-muted rounded-lg">
                <TabsTrigger 
                    value="details" 
                    className="flex items-center justify-center gap-2 h-full rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                    <FileText className="h-4 w-4" />
                    <span>Детали</span>
                </TabsTrigger>
                <TabsTrigger 
                    value="chat" 
                    className="flex items-center justify-center gap-2 h-full rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Чат</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
                <DetailsSection />
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 h-full mt-0 overflow-hidden">
                <ChatSection />
            </TabsContent>
        </Tabs>
      </div>

      {/* DESKTOP VIEW (Grid) */}
      <div className="hidden md:grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="col-span-2 overflow-y-auto pr-1 pb-4">
            <DetailsSection />
        </div>
        <div className="col-span-1">
            <ChatSection />
        </div>
      </div>
    </div>
  );
}