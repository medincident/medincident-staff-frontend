"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Info, AlertTriangle, Check, Shield, FileText, UserPlus, Clock, BellOff, CheckCheck, LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Notification } from "@/lib/types";
import { getIntentColors } from "@/lib/status-helper";

const ICON_MAP: Record<string, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  error: Shield,
  success: Check,
  file: FileText,
  user: UserPlus,
  default: Info
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", { method: "POST" });
    } catch (error) {
      console.error("Failed to mark read on server");
    }
  };

  const grouped = notifications.reduce((acc, note) => {
    if (!acc[note.date]) acc[note.date] = [];
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, Notification[]>);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        <div className="flex items-center gap-2 py-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-8 px-4 md:px-0">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="space-y-4 ml-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 p-4 border rounded-xl">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">

      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 border-b md:static md:border-none md:bg-transparent md:py-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
            <p className="text-sm text-muted-foreground">История системных сообщений</p>
          </div>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-primary hover:bg-primary/10">
            <CheckCheck className="mr-2 h-4 w-4" />
            Пометить все
          </Button>
        )}
      </div>

      <div className="space-y-8 px-4 md:px-0">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="relative">
            <div className="sticky top-20 md:top-0 z-0 flex items-center mb-4">
              <Badge variant="outline" className="bg-background text-muted-foreground font-normal px-3 py-1 border-border">
                {date}
              </Badge>
              <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
            </div>

            <div className="space-y-4 ml-2">
              {items.map((note) => {
                const Icon = ICON_MAP[note.type] || ICON_MAP.default;

                const colors = getIntentColors(note.type);

                return (
                  <div key={note.id} className="relative group pl-6 md:pl-0">
                    <div className="absolute left-0 top-3 -bottom-5 w-px bg-border md:hidden last:hidden"></div>

                    <div className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200",
                      "hover:border-primary/30",
                      !note.read && "bg-accent/5 border-accent/20",
                      note.type === 'error' && `border-destructive/30 ${colors.bg}`
                    )}>

                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                        colors.text,
                        colors.bg,
                        colors.border
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={cn("text-sm font-semibold truncate flex items-center gap-2",
                            note.type === 'error' ? colors.text : 'text-foreground'
                          )}>
                            {note.title}
                            {!note.read && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
                          </h4>
                          <span className="flex items-center text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1 opacity-70" />
                            {note.time}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {note.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
          <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
            <BellOff className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Здесь пока тихо</h3>
          <p className="text-muted-foreground mt-2 max-w-xs">
            Новые уведомления о событиях и заявках появятся здесь.
          </p>
        </div>
      )}
    </div>
  );
}