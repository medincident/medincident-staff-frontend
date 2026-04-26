"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatSection, ChatMessage } from "@/components/ui/chat-section";
import { notify } from "@/lib/toast";

interface ChatContainerProps {
  entityId: string;
  entityType: "events" | "requests";
  title?: string;
  className?: string;
}

export function ChatContainer({ 
  entityId, 
  entityType, 
  title, 
  className 
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        
        await new Promise((resolve) => setTimeout(resolve, 600));
        
        const initialMessages: ChatMessage[] = [
          {
            id: 1,
            sender: "Система",
            text: entityType === "events" 
              ? "Событие успешно зарегистрировано в системе. Ожидайте назначения ответственного."
              : "Заявка принята в работу. Инженер скоро свяжется с вами.",
            time: "10:00",
            isMe: false
          },
          {
            id: 2,
            sender: "Иванов И.И.",
            text: "Взял в работу. Буду на месте через 15 минут.",
            time: "10:15",
            isMe: false
          }
        ];

        setMessages(initialMessages);
      } catch (error) {
        console.error("Ошибка загрузки чата:", error);
        notify.error("Ошибка", "Не удалось загрузить сообщения.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [entityId, entityType]);

  const handleSendMessage = async (text: string) => {
    const tempId = Date.now();
    
    const newMsg: ChatMessage = {
      id: tempId,
      sender: "Вы",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      
    } catch (error) {
      notify.mutationError("Ошибка", "Не удалось отправить сообщение.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-card border rounded-xl min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const defaultTitle = entityType === "events" 
    ? `Чат по событию #${entityId.split('_')[1] || entityId}`
    : "Ход работ";

  return (
    <ChatSection
      title={title || defaultTitle}
      messages={messages}
      onSendMessage={handleSendMessage}
      className={className}
    />
  );
}