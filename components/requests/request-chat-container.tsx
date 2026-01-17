"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatSection, ChatMessage } from "@/components/ui/chat-section";
import { toast } from "sonner";

interface RequestChatContainerProps {
  requestId: string;
  className?: string;
}

export function RequestChatContainer({ requestId, className }: RequestChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/requests/${requestId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [requestId]);

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
      const res = await fetch(`/api/requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Send failed");
      const serverMsg = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === tempId ? serverMsg : m)));

    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось отправить сообщение" });
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
      title="Ход работ"
      messages={messages}
      onSendMessage={handleSendMessage}
      className={className}
    />
  );
}