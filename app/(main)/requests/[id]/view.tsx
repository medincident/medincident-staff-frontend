"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    User,
    Wrench,
    AlertTriangle,
    Calendar,
    Clock,
    CheckCircle2,
    FileText,
    MessageSquare,
    History as HistoryIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/toast";

import { RequestStatus } from "@/lib/types";
import { STATUS_MAP } from "@/lib/constants";
import { getBadgeColor } from "@/lib/status-helper";
import { ChatContainer } from "@/components/chat/chat-container";
import { EntityHistory } from "@/components/history/entity-history";
import { usePermissions } from "@/lib/auth/use-permissions";

import {
    ServiceRequestQueryService,
    ServiceRequestCommandService,
    RequestClassifierQueryService,
    MembershipQueryService,
    v1ServiceRequest,
    v1RequestType,
    v1EmployeeCardView
} from "@/lib/api-generated";

interface RequestDetailsViewProps {
    requestId: string;
}

function DetailsSection({
    request,
    requestType,
    status,
    onStatusChange,
    departmentEmployees,
    isLoadingEmployees,
    onAssignExecutors,
    isAssigningExecutors,
    canManage,
}: {
    request: v1ServiceRequest;
    requestType: v1RequestType | null;
    status: string;
    onStatusChange: (s: string) => void;
    departmentEmployees: v1EmployeeCardView[];
    isLoadingEmployees: boolean;
    onAssignExecutors: (employeeIds: string[]) => Promise<void>;
    isAssigningExecutors: boolean;
    canManage: boolean;
}) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <Card className="gap-3 bg-card border">
                <CardHeader>
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <Wrench className="h-3 w-3" />
                            {requestType?.name || request.typeId || "Неизвестный тип"}
                        </div>
                    </div>
                    <CardTitle className="text-lg text-foreground leading-snug">
                        {request.description}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {request.incidentId && (
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
                                    <span className="font-mono font-bold mx-1 opacity-90 text-foreground">#{request.incidentId?.substring(0,8)}</span>.
                                </p>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-warning text-xs font-semibold hover:text-warning/80 mt-1"
                                    onClick={() => router.push(`/events/${request.incidentId}`)}
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
                            Автор: <span className="text-foreground">{request.authorDisplayName || "Неизвестен"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Обновлено: {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : "-"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {canManage && (
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
                        <Select value={status} onValueChange={(v) => onStatusChange(v)}>
                            <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border">
                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {status === 'purchase' && (
                            <p className="text-[11px] text-purple bg-purple/10 p-2 rounded border border-purple/20 mt-1">
                                Время выполнения приостановлено (ожидание запчастей).
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Исполнитель</label>
                        <Select
                            value={request.executors?.[0]?.employeeId ?? "__none__"}
                            disabled={isLoadingEmployees || isAssigningExecutors}
                            onValueChange={(v) => {
                                const ids = v === "__none__" ? [] : [v];
                                void onAssignExecutors(ids);
                            }}
                        >
                            <SelectTrigger className="w-full bg-background border-primary/20 text-foreground">
                                <SelectValue placeholder={isLoadingEmployees ? "Загрузка..." : "Не назначен"} />
                            </SelectTrigger>
                            <SelectContent className="border max-h-[40vh]">
                                <SelectItem value="__none__">Не назначен</SelectItem>
                                {departmentEmployees.map((emp) => (
                                    <SelectItem key={emp.employeeId!} value={emp.employeeId!}>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{emp.displayName || `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || emp.email}</span>
                                            {emp.position && (
                                                <span className="text-xs text-muted-foreground">{emp.position}</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!isLoadingEmployees && departmentEmployees.length === 0 && (
                            <p className="text-[11px] text-muted-foreground">
                                В отделе нет сотрудников для назначения.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
            )}
        </div>
    );
}

export function RequestDetailsView({ requestId }: RequestDetailsViewProps) {
    const router = useRouter();
    const perms = usePermissions();
    const canManage = perms.canAssignRequestExecutor;

    const [request, setRequest] = useState<v1ServiceRequest | null>(null);
    const [requestType, setRequestType] = useState<v1RequestType | null>(null);
    const [status, setStatus] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [departmentEmployees, setDepartmentEmployees] = useState<v1EmployeeCardView[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isAssigningExecutors, setIsAssigningExecutors] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                const reqRes = await ServiceRequestQueryService.serviceRequestQueryGetServiceRequest(requestId);
                if (reqRes && "serviceRequest" in reqRes && reqRes.serviceRequest) {
                    const foundRequest = reqRes.serviceRequest;
                    setRequest(foundRequest);
                    
                    const reqStatus = (foundRequest.status || "").toLowerCase().replace("service_request_status_", "");
                    setStatus(reqStatus);

                    if (foundRequest.typeId) {
                        try {
                            const typeRes = await RequestClassifierQueryService.requestClassifierQueryGetRequestType(foundRequest.typeId);
                            if (typeRes && "requestType" in typeRes && typeRes.requestType) {
                                setRequestType(typeRes.requestType);
                            }
                        } catch (e) {
                            console.warn("Failed to load request type", e);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load request:", error);
                notify.error("Ошибка загрузки данных", "Не удалось получить информацию о заявке.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [requestId]);

    useEffect(() => {
        if (!request?.departmentId) return;

        let cancelled = false;
        setIsLoadingEmployees(true);
        (async () => {
            try {
                const res = await MembershipQueryService.membershipQueryListEmployeesByDepartment(
                    request.departmentId!,
                    100,
                );
                if (cancelled) return;
                if (res && "items" in res && Array.isArray(res.items)) {
                    setDepartmentEmployees(res.items);
                }
            } catch (e) {
                console.warn("Failed to load department employees", e);
            } finally {
                if (!cancelled) setIsLoadingEmployees(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [request?.departmentId]);

    const handleAssignExecutors = async (employeeIds: string[]) => {
        if (!request?.id) return;

        setIsAssigningExecutors(true);
        try {
            await ServiceRequestCommandService.serviceRequestCommandAssignExecutors(request.id, {
                executorEmployeeIds: employeeIds,
            });

            // Локально обновляем executors, чтобы UI среагировал сразу.
            setRequest({
                ...request,
                executors: employeeIds.map((id) => ({ employeeId: id })),
            });

            notify.mutationSuccess(
                "Исполнитель обновлён",
                employeeIds.length === 0
                    ? "Назначение снято."
                    : "Заявка передана выбранному исполнителю.",
            );
        } catch (error) {
            console.error(error);
            notify.apiError(error, "Не удалось обновить исполнителя.");
        } finally {
            setIsAssigningExecutors(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!request || !request.id) return;

        const prevStatus = status;
        setStatus(newStatus);

        try {
            let apiStatus = newStatus.toUpperCase();
            if (!apiStatus.startsWith("SERVICE_REQUEST_STATUS_")) {
                apiStatus = `SERVICE_REQUEST_STATUS_${apiStatus}`;
            }

            await ServiceRequestCommandService.serviceRequestCommandUpdateServiceRequestStatus(request.id, {
                newStatus: apiStatus as any
            });

            const updatedRequest = { ...request, status: apiStatus };
            setRequest(updatedRequest);

            notify.mutationSuccess(
                "Статус обновлён",
                `Заявка переведена в статус "${STATUS_MAP[newStatus as RequestStatus]}".`,
            );
        } catch (error) {
            console.error(error);
            setStatus(prevStatus);
            notify.apiError(error, "Не удалось обновить статус заявки.");
        }
    };

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
            <div className="flex items-start gap-3 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0 hover:bg-muted">
                    <ArrowLeft className="h-4 w-4 text-foreground" />
                </Button>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h1 className="text-lg font-bold text-foreground line-clamp-2 break-words min-w-0">
                            Заявка #{request.id?.substring(0,8)}
                        </h1>
                        <Badge variant="outline" className={`shrink-0 ${getBadgeColor(status as RequestStatus)}`}>
                            {STATUS_MAP[status as RequestStatus] || status}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                        Создана {request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}
                    </p>
                </div>
            </div>

            <div className="md:hidden flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-3 h-12 p-1 mb-4 bg-muted rounded-lg border shrink-0">
                        <TabsTrigger value="details" className="flex gap-1.5"><FileText className="h-4 w-4" /> <span>Детали</span></TabsTrigger>
                        <TabsTrigger value="history" className="flex gap-1.5"><HistoryIcon className="h-4 w-4" /> <span>История</span></TabsTrigger>
                        <TabsTrigger value="chat" className="flex gap-1.5"><MessageSquare className="h-4 w-4" /> <span>Чат</span></TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
                        <DetailsSection
                            request={request}
                            requestType={requestType}
                            status={status}
                            onStatusChange={handleStatusChange}
                            departmentEmployees={departmentEmployees}
                            isLoadingEmployees={isLoadingEmployees}
                            onAssignExecutors={handleAssignExecutors}
                            isAssigningExecutors={isAssigningExecutors}
                            canManage={canManage}
                        />
                    </TabsContent>
                    <TabsContent value="history" className="flex-1 overflow-y-auto mt-0">
                        <EntityHistory entityType="request" entityId={requestId} />
                    </TabsContent>
                    <TabsContent value="chat" className="flex-1 mt-0 h-full overflow-hidden">
                        <ChatContainer entityId={requestId} entityType="requests" className="h-full" />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="hidden md:grid grid-cols-3 gap-6 items-start">
                <div className="col-span-2 space-y-6">
                    <DetailsSection
                            request={request}
                            requestType={requestType}
                            status={status}
                            onStatusChange={handleStatusChange}
                            departmentEmployees={departmentEmployees}
                            isLoadingEmployees={isLoadingEmployees}
                            onAssignExecutors={handleAssignExecutors}
                            isAssigningExecutors={isAssigningExecutors}
                            canManage={canManage}
                        />

                    <EntityHistory entityType="request" entityId={requestId} />
                </div>
                <div className="col-span-1 sticky top-24 h-[600px]">
                    <ChatContainer entityId={requestId} entityType="requests" />
                </div>
            </div>
        </div>
    );
}
