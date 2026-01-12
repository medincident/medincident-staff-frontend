"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Типы данных
export interface ChatMessage {
  id: number | string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
  isSystem?: boolean;
  role?: string;
}

interface ChatSectionProps {
  title?: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  className?: string;
}

export function ChatSection({ 
  title = "Обсуждение", 
  messages, 
  onSendMessage,
  className 
}: ChatSectionProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <Card className={cn("flex flex-col h-[calc(100vh-280px)] md:h-[600px] p-0 gap-0 overflow-hidden bg-card", className)}>
        
        {/* Хедер */}
        <CardHeader className="pt-3 border-b bg-muted/50 gap-0.5 px-4 pb-3!">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    {title}
                </span>
                <span className="ml-auto bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                    {messages.filter(m => !m.isSystem).length}
                </span>
            </CardTitle>
        </CardHeader>
        
        {/* Контент */}
        <CardContent className="flex-1 p-0 overflow-hidden relative bg-background/50">
            <ScrollArea className="h-full w-full">
                <div className="flex flex-col justify-end min-h-full p-4 gap-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                            {msg.isSystem ? (
                                <div className="w-full flex justify-center my-2">
                                    <span className="text-[10px] bg-muted/80 text-muted-foreground px-3 py-1 rounded-full border">
                                        {msg.text}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Avatar className="h-8 w-8 border shrink-0">
                                        <AvatarFallback className={msg.isMe ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
                                            {msg.sender[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex flex-col max-w-[85%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-3 py-2 rounded-xl text-sm break-words ${
                                            msg.isMe 
                                                ? 'border-primary/20 bg-primary/5 border text-foreground rounded-tr-sm' 
                                                : 'bg-card border text-foreground rounded-tl-sm'
                                        }`}>
                                            {!msg.isMe && (
                                                <div className="flex justify-between items-baseline gap-2 mb-0.5 opacity-90">
                                                    <span className="text-[10px] font-bold">{msg.sender}</span>
                                                </div>
                                            )}
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1 px-1 opacity-70">
                                            {msg.time} {msg.role ? `• ${msg.role}` : ''}
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

        {/* Футер */}
        <CardFooter className="p-3 border-t bg-card shrink-0 pt-3!">
            <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
                <Input 
                    placeholder="Написать сообщение..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    // ИСПРАВЛЕНО: Убрал ring-1, добавил ring-0 и ring-offset-0.
                    // Теперь только цвет рамки меняется на primary.
                    className="flex-1 bg-background border-input transition-colors min-h-[40px] hover:border-primary focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button size="icon" type="submit" className="h-10 w-10 shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </CardFooter>
    </Card>
  );
}