"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatSection, ChatMessage } from "@/components/ui/chat-section";
import { useToast } from "@/components/providers/toast-provider";

interface EventChatContainerProps {
  eventId: string;
  className?: string;
}

export function EventChatContainer({ eventId, className }: EventChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/events/${eventId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки чата:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [eventId]);

  const handleSendMessage = async (text: string) => {
    const tempId = Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: "Вы",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/events/${eventId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Ошибка отправки");

      const serverMsg = await res.json();
      
      setMessages((prev) => 
        prev.map((m) => (m.id === tempId ? serverMsg : m))
      );
      
    } catch (error) {
      toast.error("Ошибка", "Не удалось отправить сообщение");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-card border rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ChatSection
      title={`Чат по событию #${eventId.split('_')[1] || eventId}`}
      messages={messages}
      onSendMessage={handleSendMessage}
      className={className}
    />
  );
}