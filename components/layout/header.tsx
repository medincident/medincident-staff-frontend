"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Check,
  Info,
  AlertTriangle,
  CheckCheck
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(3);

  const user = {
    name: "Иванов И.И.",
    role: "Регистратор",
    avatar: "ИИ"
  };

  // Используем семантические цвета для иконок уведомлений
  const notifications = [
    { id: 1, title: "Новое событие", desc: "Назначено ответственное лицо", time: "5 мин назад", icon: Info, color: "text-blue-500" },
    { id: 2, title: "Сбой системы", desc: "Не удалось отправить отчет", time: "1 час назад", icon: AlertTriangle, color: "text-warning" },
    { id: 3, title: "Статус обновлен", desc: "Событие #123 закрыто", time: "2 часа назад", icon: Check, color: "text-success" },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    // ИСПРАВЛЕНО: bg-card border-border
    <header className="bg-card border-b border-border sticky top-0 z-30 h-14 px-4 flex justify-between items-center transition-colors duration-300 shadow-sm">
      
      <div className="flex flex-col justify-center">
        {/* ИСПРАВЛЕНО: text-foreground */}
        <h1 className="text-sm font-bold text-foreground leading-tight">Мониторинг НС</h1>
        {/* ИСПРАВЛЕНО: text-muted-foreground */}
        <p className="text-[10px] text-muted-foreground font-medium">{user.role}</p>
      </div>

      <div className="flex items-center gap-2">
        
        {/* --- УВЕДОМЛЕНИЯ --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-card border-border">
            
            {/* ЗАГОЛОВОК */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm text-foreground">Уведомления</span>
                {unreadCount > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto py-0.5 px-2 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/10"
                        onClick={() => setUnreadCount(0)}
                    >
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Пометить все
                    </Button>
                )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((note) => (
                    <DropdownMenuItem key={note.id} className="flex items-start gap-3 p-3 cursor-pointer focus:bg-muted/50">
                        <div className={`mt-1 ${note.color}`}>
                            <note.icon size={16} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                                <p className="text-sm font-medium leading-none text-foreground">{note.title}</p>
                                {unreadCount > 0 && note.id === 1 && (
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{note.desc}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{note.time}</p>
                        </div>
                    </DropdownMenuItem>
                ))}
            </div>
            <div className="p-2 border-t border-border text-center">
                <Link href="/notifications" className="text-xs text-primary hover:underline">
                    Показать все
                </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* --- МЕНЮ ПОЛЬЗОВАТЕЛЯ --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {user.avatar}
                    </AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">ivanov.i@hospital.ru</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            
            <Link href="/menu">
                <DropdownMenuItem className="cursor-pointer focus:bg-muted/50">
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                </DropdownMenuItem>
            </Link>
            
            <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer focus:bg-muted/50">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
            >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}