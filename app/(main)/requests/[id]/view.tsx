"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    MapPin,
    User,
    Wrench,
    AlertTriangle,
    Calendar,
    Clock,
    CheckCircle2,
    FileText,
    MessageSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { RequestStatus, ServiceRequest } from "@/lib/types";
import { STATUS_MAP, PRIORITY_MAP, SERVICE_TYPE_CONFIG } from "@/lib/constants";
import { getBadgeColor } from "@/lib/status-helper";
import { ChatContainer } from "@/components/chat/chat-container";
import { requestsDb } from "@/lib/mock-db";

interface RequestDetailsViewProps {
    requestId: string;
}

export function RequestDetailsView({ requestId }: RequestDetailsViewProps) {
    const router = useRouter();

    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const [status, setStatus] = useState<RequestStatus | "">("");
    const [isLoading, setIsLoading] = useState(true);

    // 1. ЗАГРУЗКА ДАННЫХ ИЗ МОКОВ
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Имитируем загрузку по сети
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Ищем заявку в нашем локальном массиве
                const foundRequest = requestsDb.find(r => r.id === requestId);
                
                if (foundRequest) {
                    setRequest(foundRequest);
                    setStatus(foundRequest.status as RequestStatus);
                }
            } catch (error) {
                console.error("Failed to load request:", error);
                toast.error("Ошибка загрузки данных");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [requestId]);

    // 2. ОБНОВЛЕНИЕ СТАТУСА
    const handleStatusChange = async (newStatus: RequestStatus) => {
        if (!request) return;
        
        const prevStatus = status;
        setStatus(newStatus);
        
        try {
            // Имитируем сетевую задержку сохранения
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const updatedRequest = { ...request, status: newStatus };
            
            // Обновляем заявку в глобальном моке
            const reqIndex = requestsDb.findIndex(r => r.id === requestId);
            if (reqIndex > -1) {
                requestsDb[reqIndex] = updatedRequest;
            }
            
            setRequest(updatedRequest);
            toast.success("Статус обновлен", { description: `Заявка переведена в статус "${STATUS_MAP[newStatus]}"` });
        } catch (error) {
            console.error(error);
            setStatus(prevStatus);
            toast.error("Ошибка", { description: "Не удалось обновить статус" });
        }
    };

    const DetailsSection = () => {
        if (!request) return null;

        // Получаем конфиг службы (название и отдел)
        const serviceConfig = SERVICE_TYPE_CONFIG[request.type];

        return (
            <div className="space-y-6">
                <Card className="gap-3 bg-card border">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench className="h-3 w-3" />
                                {serviceConfig?.label || request.type}
                            </div>
                            <Badge variant="outline" className={`border-0 ${getBadgeColor(request.priority)}`}>
                                {PRIORITY_MAP[request.priority]}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg text-foreground leading-snug">
                            {request.description}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 text-sm text-foreground bg-muted/50 p-3 rounded-lg border-0">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">{request.location}</span>
                        </div>

                        {request.linkedEventId && (
                            <div className="flex items-start gap-3 text-sm p-4 rounded-lg border transition-colors bg-warning/10 border-warning/20">
                                <div className="p-1.5 bg-warning/20 rounded-md shrink-0">
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-warning block">
                                        Связанный инцидент безопасности
                                    </span>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Эта работа выполняется для устранения последствий события
                                        <span className="font-mono font-bold mx-1 opacity-90 text-foreground">#{request.linkedEventId}</span>.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-warning text-xs font-semibold hover:text-warning/80 mt-1"
                                        onClick={() => router.push(`/events/${request.linkedEventId}`)}
                                    >
                                        Перейти к событию &rarr;
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Separator className="bg-border" />

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Автор: <span className="text-foreground">{request.authorName || "Неизвестен"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Срок: 24 часа
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5 gap-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            Управление заявкой
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground ml-1">Текущий статус</label>
                            <Select value={status} onValueChange={(v) => handleStatusChange(v as RequestStatus)}>
                                <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border">
                                    {Object.entries(STATUS_MAP).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Фиолетовое уведомление для статуса 'Закупка' */}
                            {status === 'purchase' && (
                                <p className="text-[11px] text-purple bg-purple/10 p-2 rounded border border-purple/20 mt-1">
                                    Время выполнения приостановлено (ожидание запчастей).
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground ml-1">Исполнитель</label>
                                <Select defaultValue="worker_1">
                                    <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                                        <SelectValue placeholder="Не назначен" />
                                    </SelectTrigger>
                                    <SelectContent className="border">
                                        <SelectItem value="not_assigned">Не назначен</SelectItem>
                                        <SelectItem value="worker_1">Петров В.В.</SelectItem>
                                        <SelectItem value="worker_2">Сидоров А.А.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground ml-1">Ответственный отдел</label>
                                <div className="flex items-center h-10 px-3 rounded-md border border-primary/20 bg-background text-[11px] leading-tight text-muted-foreground">
                                    {serviceConfig?.dept || "Не определен"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] md:h-auto pb-4 md:pb-20">
                <div className="flex items-center gap-3 shrink-0">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" /><Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="hidden md:grid grid-cols-3 gap-6 items-start">
                    <div className="col-span-2 space-y-6">
                        <div className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="flex justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-6 w-24 rounded-full" /></div>
                            <Skeleton className="h-8 w-full" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-24 w-full rounded-lg" />
                            <Separator className="my-2" /><div className="flex gap-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-32" /></div>
                        </div>
                    </div>
                    <div className="col-span-1 h-[600px] rounded-xl border bg-card p-4"><Skeleton className="h-full w-full rounded-lg" /></div>
                </div>
            </div>
        );
    }

    if (!request) return <div className="p-8 text-center text-muted-foreground">Заявка не найдена</div>;

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-6rem)] md:h-auto pb-4 md:pb-20">
            <div className="flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0 hover:bg-muted">
                    <ArrowLeft className="h-4 w-4 text-foreground" />
                </Button>
                <div className="min-w-0">
                    <h1 className="text-lg font-bold text-foreground flex items-center gap-2 truncate">
                        Заявка #{request.number}
                        <Badge variant="outline" className={`ml-1 shrink-0 ${getBadgeColor(status as RequestStatus)}`}>
                            {STATUS_MAP[status as RequestStatus] || status}
                        </Badge>
                    </h1>
                    <p className="text-xs text-muted-foreground truncate">
                        Создана {request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}
                    </p>
                </div>
            </div>

            <div className="md:hidden flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2 h-12 p-1 mb-4 bg-muted rounded-lg border shrink-0">
                        <TabsTrigger value="details" className="flex gap-2"><FileText className="h-4 w-4" /> <span>Детали</span></TabsTrigger>
                        <TabsTrigger value="chat" className="flex gap-2"><MessageSquare className="h-4 w-4" /> <span>Чат</span></TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="flex-1 overflow-y-auto mt-0"><DetailsSection /></TabsContent>
                    
                    {/* Передаем entityId и entityType в ChatContainer */}
                    <TabsContent value="chat" className="flex-1 mt-0 h-full overflow-hidden">
                        <ChatContainer entityId={requestId} entityType="requests" className="h-full" />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="hidden md:grid grid-cols-3 gap-6 items-start">
                <div className="col-span-2 space-y-6"><DetailsSection /></div>
                
                {/* Передаем entityId и entityType в ChatContainer */}
                <div className="col-span-1 sticky top-24 h-[600px]">
                    <ChatContainer entityId={requestId} entityType="requests" />
                </div>
            </div>
        </div>
    );
}