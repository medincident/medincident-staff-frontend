"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatSection, ChatMessage } from "@/components/ui/chat-section";
import { apiClient } from "@/lib/api-client";
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

  // Формируем базовый путь в зависимости от типа сущности
  const apiPath = `/api/${entityType}/${entityId}/messages`;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        // Используем apiClient вместо нативного fetch
        const res = await apiClient.get<ChatMessage[]>(apiPath);
        setMessages(res.data);
      } catch (error) {
        console.error("Ошибка загрузки чата:", error);
        toast.error("Ошибка", { description: "Не удалось загрузить сообщения" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [apiPath]);

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
      const res = await apiClient.post<ChatMessage>(apiPath, { text });
      const serverMsg = res.data;

      // Заменяем временное сообщение серверным
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? serverMsg : m))
      );
    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось отправить сообщение" });
      // Удаляем оптимистичное сообщение при ошибке
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