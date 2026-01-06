"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  Settings, 
  HelpCircle, 
  LogOut, 
  Shield, 
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  User,
  Mail,
  Building
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MenuPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = {
    name: "Иванов Иван Иванович",
    email: "ivanov.i@hospital.ru",
    role: "Медбрат",
    department: "Терапевтическое отделение",
    initials: "ИИ"
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Функция для отображения иконки
  const ThemeIcon = () => {
    if (!mounted) return <Laptop className="h-5 w-5" />;
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    if (theme === 'light') return <Sun className="h-5 w-5" />;
    return <Laptop className="h-5 w-5" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Профиль и настройки</h1>
        <p className="text-sm text-muted-foreground">Управление аккаунтом и параметрами системы</p>
      </div>

      {/* СЕТКА: 1 колонка на Mobile, 3 колонки на Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА: Карточка пользователя */}
        <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-md bg-gradient-to-b from-primary to-primary/90 text-primary-foreground overflow-hidden">
                <CardContent className="p-6 flex flex-row md:flex-col items-center gap-4 md:text-center">
                    {/* Аватар */}
                    <Avatar className="h-16 w-16 md:h-24 md:w-24 border-4 border-background/20 bg-background/10 text-primary-foreground shadow-xl">
                        <AvatarFallback className="bg-transparent text-xl md:text-3xl font-bold">
                            {user.initials}
                        </AvatarFallback>
                    </Avatar>
                    
                    {/* Инфо */}
                    <div className="space-y-1">
                        <h2 className="text-lg md:text-xl font-bold leading-tight">{user.name}</h2>
                        <div className="flex flex-wrap gap-2 md:justify-center mt-2">
                             <Badge variant="secondary" className="bg-background/20 text-primary-foreground hover:bg-background/30 border-none font-normal">
                                {user.role}
                             </Badge>
                        </div>
                    </div>
                </CardContent>
                
                {/* Доп. инфо */}
                <div className="bg-black/10 p-4 text-xs md:text-sm text-primary-foreground/90 space-y-2">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 opacity-70" />
                        <span>{user.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 opacity-70" />
                        <span>{user.email}</span>
                    </div>
                </div>
            </Card>

            {/* Кнопка выхода (Desktop) */}
            <div className="hidden md:block">
                <Button 
                    variant="outline" 
                    className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти из системы
                </Button>
                 <p className="text-center text-[10px] text-muted-foreground mt-4">Версия 1.0.0 (2025)</p>
            </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Широкая): Настройки и Меню */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Секция: Настройки приложения */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-base text-foreground">Настройки приложения</CardTitle>
                    <CardDescription className="text-muted-foreground">Внешний вид и уведомления</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        
                        {/* Выбор темы */}
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                    <ThemeIcon />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-foreground">Тема оформления</p>
                                    <p className="text-xs text-muted-foreground">Выберите цветовую схему</p>
                                </div>
                            </div>
                            
                            {mounted && (
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger className="w-[130px] h-9 bg-background border-input">
                                        <SelectValue placeholder="Тема" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <div className="flex items-center gap-2"><Sun className="h-4 w-4"/> Светлая</div>
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <div className="flex items-center gap-2"><Moon className="h-4 w-4"/> Темная</div>
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <div className="flex items-center gap-2"><Laptop className="h-4 w-4"/> Системная</div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        
                        {/* Общие настройки */}
                        <Link href="/settings" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-foreground">Общие настройки</p>
                                    <p className="text-xs text-muted-foreground">Язык, часовой пояс, уведомления</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Секция: Администрирование */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-base text-foreground">Панель управления</CardTitle>
                    <CardDescription className="text-muted-foreground">Доступно для роли: Администратор</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Link href="/admin/classifier" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-warning/10 rounded-lg text-warning">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Классификатор НС</p>
                                <p className="text-xs text-muted-foreground">Типы событий</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link href="/admin/structure" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border">
                        <div className="flex items-center gap-3">
                            {/* Синий цвет оставил для структуры, чтобы отличалось, но можно заменить на primary/10 */}
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <Building className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Структура</p>
                                <p className="text-xs text-muted-foreground">Клиники и отделения</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link href="/admin/users" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-success/10 rounded-lg text-success">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Пользователи</p>
                                <p className="text-xs text-muted-foreground">Сотрудники и права</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>

            {/* Секция: Помощь */}
            <Card className="bg-card border-border">
                 <Link href="/help" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Справка и поддержка</p>
                        </div>
                    </div>
                     <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
            </Card>

            {/* Кнопка выхода (Mobile) */}
            <div className="md:hidden pt-4">
                 <Button 
                    variant="destructive" 
                    className="w-full h-12 text-destructive border-destructive/20 shadow-none bg-destructive/10 hover:bg-destructive/20"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Выйти из аккаунта
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-4">Версия 1.0.0</p>
            </div>

        </div>
      </div>
    </div>
  );
}