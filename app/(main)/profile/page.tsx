"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Moon,
    Sun,
    Laptop,
    Mail,
    Building,
    UserCog,
    Briefcase,
    Palette
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- ОБНОВЛЕННЫЕ ИМПОРТЫ ---
import { User } from "@/lib/types";
import { ROLE_NAMES } from "@/lib/constants";

export default function MenuPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [user, setUser] = useState<User | any>(null); // any для поддержки поля department из профиля
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/user/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        router.push("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-24 hidden md:block" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-3">
                        <div className="rounded-xl border bg-card text-card-foreground overflow-hidden">
                            <Skeleton className="h-32 w-full rounded-none" />
                            <div className="px-6 pb-6 relative">
                                <div className="-mt-12 mb-4 flex justify-between items-end">
                                    <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
                                    <Skeleton className="h-6 w-24 rounded-full mb-2" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Skeleton className="h-6 w-48 mb-2" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-32 mb-3" />
                                <div className="rounded-xl border bg-card text-card-foreground p-2 space-y-2">
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Профиль</h1>
                    <p className="text-muted-foreground mt-1">Управление аккаунтом и настройки</p>
                </div>
                <Button
                    variant="outline"
                    className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" /> Выйти
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-5 space-y-3">
                    <Card className="overflow-hidden py-0!">
                        <div className="h-32 bg-gradient-to-b from-primary/20 via-primary/5 to-card" />

                        <CardContent className="px-6 pb-6 relative">
                            <div className="-mt-28 mb-4 flex justify-between items-end">
                                <Avatar className="h-24 w-24 border-4 border-card bg-background">
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                                    {user.role}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground leading-tight">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">ID: {user.id}</p>
                                </div>

                                <Separator />

                                <div className="space-y-3 text-sm">
                                    {/* Оставили только должность, убрали дубликат роли */}
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Briefcase className="h-4 w-4 shrink-0 opacity-70" />
                                        <span className="text-foreground">{user.position || "Сотрудник"}</span>
                                    </div>
                                    {/* Вернули user.department */}
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Building className="h-4 w-4 shrink-0 opacity-70" />
                                        <span className="text-foreground">{user.department || "Отделение не указано"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="h-4 w-4 shrink-0 opacity-70" />
                                        <span className="text-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-7 space-y-6">

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                            Рабочее пространство
                        </h3>
                        <Card className="py-0!">
                            <CardContent className="p-2">
                                <MenuLink
                                    href="/profile/department"
                                    icon={UserCog}
                                    title="Мое подразделение"
                                    desc="Управление руководителями и доступом"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                            Настройки
                        </h3>
                        <Card className="py-0!">
                            <CardContent className="p-2 space-y-1">

                                <div className="p-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-muted rounded-lg text-muted-foreground">
                                            <Palette className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Внешний вид</p>
                                            <p className="text-xs text-muted-foreground">Цветовая схема интерфейса</p>
                                        </div>
                                    </div>

                                    {mounted && (
                                        <div className="bg-muted/50 p-1.5 rounded-xl flex items-center justify-between mt-1">
                                            {[
                                                { id: 'light', icon: Sun, label: 'Светлая' },
                                                { id: 'dark', icon: Moon, label: 'Темная' },
                                                { id: 'system', icon: Laptop, label: 'Авто' }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all duration-200",
                                                        theme === t.id
                                                            ? "bg-background text-foreground ring-1 ring-black/5 dark:ring-white/10"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                    )}
                                                >
                                                    <t.icon className="h-3.5 w-3.5" />
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-1 opacity-50" />

                                <MenuLink
                                    href="/profile/settings"
                                    icon={Settings}
                                    title="Общие настройки"
                                    desc="Уведомления, пароль и безопасность"
                                />

                                <MenuLink
                                    href="/profile/help"
                                    icon={HelpCircle}
                                    title="Помощь и справка"
                                    desc="Инструкции по работе с системой"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:hidden pt-4">
                        <Button
                            variant="destructive"
                            size="lg"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Выйти из аккаунта
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground mt-6">Версия системы 1.0.0</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

const MenuLink = ({ href, icon: Icon, title, desc, colorClass = "bg-muted text-muted-foreground" }: any) => (
    <Link
        href={href}
        className={cn(
            "flex items-center justify-between p-4 rounded-xl transition-all duration-200 group border border-transparent"
            // Убрал hover:bg-muted/50
        )}
    >
        <div className="flex items-center gap-4">
            <div className={cn("p-2.5 rounded-lg transition-colors", colorClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </p>
                {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
            </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
    </Link>
);