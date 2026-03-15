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

// Импорт сервисов
import { getNotifications, markAllAsRead } from "@/lib/services/notifications";

const ICON_MAP: Record<string, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  error: Shield,
  success: Check,
  file: FileText,
  user: UserPlus,
  default: Info
};

export function NotificationsView() {
  const router = useRouter();
  
  // --- STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleMarkAllRead = async () => {
    const prevNotifications = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark read on server");
      setNotifications(prevNotifications);
    }
  };

  const grouped = notifications.reduce((acc, note) => {
    if (!acc[note.date]) acc[note.date] = [];
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, Notification[]>);

  // --- RENDER ---
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">

      {/* HEADER */}
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 border-b md:static md:border-none md:bg-transparent md:py-0 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
            <p className="text-sm text-muted-foreground">История системных сообщений</p>
          </div>
        </div>
        
        {/* Кнопка скрывается при загрузке, чтобы не мелькать */}
        {!isLoading && notifications.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-primary hover:bg-primary/10">
            <CheckCheck className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Пометить все</span>
          </Button>
        )}
      </div>

      {/* DESKTOP CONTENT */}
      <div className="hidden md:block space-y-8">
        {isLoading ? (
           /* DESKTOP SKELETONS */
           <div className="space-y-8">
              {[1, 2].map((group) => (
                 <div key={`group-skel-${group}`} className="relative">
                    <div className="flex items-center mb-4">
                       <Skeleton className="h-6 w-24 rounded-full" /> {/* Date badge */}
                       <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
                    </div>
                    <div className="space-y-3">
                       {[1, 2, 3].map((item) => (
                          <div key={`item-skel-${item}`} className="flex items-start gap-4 p-4 rounded-xl border">
                             <Skeleton className="h-10 w-10 rounded-full shrink-0" /> {/* Icon */}
                             <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex justify-between items-start">
                                   <Skeleton className="h-4 w-1/3" /> {/* Title */}
                                   <Skeleton className="h-4 w-16" /> {/* Time */}
                                </div>
                                <Skeleton className="h-3 w-3/4" /> {/* Desc line 1 */}
                                <Skeleton className="h-3 w-1/2" /> {/* Desc line 2 */}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           Object.entries(grouped).map(([date, items]) => (
             <div key={date} className="relative">
               <div className="flex items-center mb-4">
                  <Badge variant="outline" className="px-3 py-1">{date}</Badge>
                  <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
               </div>
               <div className="space-y-3">
                 {items.map((note) => {
                   const Icon = ICON_MAP[note.type] || ICON_MAP.default;
                   const colors = getIntentColors(note.type);
                   return (
                     <div key={note.id} className={cn(
                       "flex items-start gap-4 p-4 rounded-xl border bg-card transition-all hover:border-primary/30",
                       !note.read && "bg-accent/5 border-accent/20",
                       note.type === 'error' && `border-destructive/30 ${colors.bg}`
                     )}>
                       <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 border", colors.text, colors.bg, colors.border)}>
                         <Icon className="h-5 w-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                           <h4 className={cn("text-sm font-semibold truncate", note.type === 'error' ? colors.text : 'text-foreground')}>{note.title} {!note.read && <span className="inline-block w-2 h-2 bg-primary rounded-full ml-1" />}</h4>
                           <span className="text-[10px] text-muted-foreground flex items-center bg-muted px-1.5 py-0.5 rounded"><Clock className="h-3 w-3 mr-1"/>{note.time}</span>
                         </div>
                         <p className="text-sm text-muted-foreground mt-1">{note.desc}</p>
                       </div>
                     </div>
                   )
                 })}
               </div>
             </div>
           ))
        )}
      </div>

      {/* MOBILE CONTENT */}
      <div className="md:hidden space-y-6 px-4">
         {isLoading ? (
            /* MOBILE SKELETONS */
            <div className="space-y-6">
               {[1, 2].map((group) => (
                  <div key={`mob-group-${group}`}>
                     <div className="flex items-center mb-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
                     </div>
                     <div className="space-y-6">
                        {[1, 2].map((item) => (
                           <div key={`mob-item-${item}`} className="relative pl-6">
                              {/* Timeline line skeleton */}
                              <div className="absolute left-0 top-3 -bottom-8 w-px bg-border last:bottom-0"></div>
                              <div className="absolute -left-0.5 top-5 w-1.5 h-1.5 rounded-full bg-border"></div>
                              
                              <div className="flex gap-3 p-3 rounded-xl border bg-card">
                                 <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                 <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex justify-between">
                                       <Skeleton className="h-3 w-24" />
                                       <Skeleton className="h-3 w-10" />
                                    </div>
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            Object.entries(grouped).map(([date, items]) => (
             <div key={date}>
                <div className="sticky top-15 z-10 flex items-center mb-4 bg-background py-2">
                  <Badge variant="outline" className="px-3 py-1 font-normal bg-background">{date}</Badge>
                  <div className="h-px bg-border flex-1 ml-4 opacity-50"></div>
                </div>
                
                <div className="space-y-6">
                  {items.map((note) => {
                    const Icon = ICON_MAP[note.type] || ICON_MAP.default;
                    const colors = getIntentColors(note.type);
                    return (
                      <div key={note.id} className="relative pl-6">
                          <div className="absolute left-0 top-3 -bottom-8 w-px bg-border last:bottom-0"></div>
                          <div className="absolute -left-0.5 top-5 w-1.5 h-1.5 rounded-full bg-border"></div>

                          <div className={cn(
                            "flex gap-3 p-3 rounded-xl border bg-card transition-all",
                            !note.read && "bg-accent/5 border-accent/20",
                            note.type === 'error' && `border-destructive/30 ${colors.bg}`
                          )}>
                             <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 border", colors.text, colors.bg, colors.border)}>
                                <Icon className="h-4 w-4" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                   <h4 className={cn("text-sm font-semibold truncate leading-tight", note.type === 'error' ? colors.text : 'text-foreground')}>
                                     {note.title}
                                     {!note.read && <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full ml-1 align-top" />}
                                   </h4>
                                   <span className="text-[10px] text-muted-foreground shrink-0">{note.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{note.desc}</p>
                             </div>
                          </div>
                      </div>
                    )
                  })}
                </div>
             </div>
            ))
         )}
      </div>

      {!isLoading && notifications.length === 0 && (
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