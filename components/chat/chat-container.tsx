"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatSection, ChatMessage } from "@/components/ui/chat-section";
import { toast } from "sonner";

interface ChatContainerProps {
  entityId: string;
  entityType: "events" | "requests"; // Определяем, к чему относится чат
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
        
        // Имитируем сетевую задержку загрузки истории чата
        await new Promise((resolve) => setTimeout(resolve, 600));
        
        // Генерируем моковые сообщения в зависимости от типа
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
        toast.error("Ошибка", { description: "Не удалось загрузить сообщения" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [entityId, entityType]);

  const handleSendMessage = async (text: string) => {
    const tempId = Date.now();
    
    // Формируем наше сообщение
    const newMsg: ChatMessage = {
      id: tempId,
      sender: "Вы",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    // Оптимистично добавляем в UI
    setMessages((prev) => [...prev, newMsg]);

    try {
      // Имитируем отправку на сервер
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      // В реальном приложении мы бы заменили tempId на id от сервера.
      // В моковом варианте просто оставляем всё как есть.
      
    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось отправить сообщение" });
      // Удаляем сообщение из UI, если "сервер" вернул ошибку
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

  // Дефолтный заголовок, если не передан кастомный
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