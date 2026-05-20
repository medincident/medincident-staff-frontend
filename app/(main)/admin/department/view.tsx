"use client";

import { useState, useEffect } from "react";
import {
  Save,
  ShieldAlert,
  Loader2,
  UserCheck,
  Users,
  Plane,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/toast";
import {
  MembershipQueryService,
  MembershipCommandService,
  OrgStructureQueryService,
  StatsQueryService,
  v1EmployeeCardView,
} from "@/lib/api-generated";
import { getMyEmployeeInOrg } from "@/lib/auth/get-my-employee";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useSession } from "next-auth/react";

export function DepartmentView() {
  const { data: session } = useSession();
  const { orgId, isResolving: isOrgResolving } = useActiveOrgId();

  const [headId, setHeadId] = useState("");
  const [isActingEnabled, setIsActingEnabled] = useState(false);
  const [actingId, setActingId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [staff, setStaff] = useState<v1EmployeeCardView[]>([]);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  // Считаем staff.length нельзя — list пагинируется (limit 100), KPI уехало бы.
  const [stats, setStats] = useState<{ employees: number; onVacation: number } | null>(null);

  // Сохраняем оригинальные значения, чтобы корректно вычислять diff при сохранении.
  const [origHeadId, setOrigHeadId] = useState("");
  const [origDeputyId, setOrigDeputyId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOrgResolving) return;
    const loadData = async () => {
      if (!session) return;

      try {
        setIsLoading(true);

        const userId = (session.user as any)?.id;
        if (!userId) return;

        // Берём employee именно для активной организации — у мульти-орг
        // юзера в каждой орге своё отделение.
        const emp = await getMyEmployeeInOrg(userId, orgId);
        if (!emp?.departmentId) {
          // Не показываем тост — для sysadmin / неработающих в этой орге
          // это нормальное состояние, отрендерим заглушку ниже.
          setIsLoading(false);
          return;
        }

        setDepartmentId(emp.departmentId);

        // allSettled — у не-админа 403 на stats не должен валить весь экран.
        const [deptRes, staffRes, statsRes, headRes] = await Promise.allSettled([
          OrgStructureQueryService.orgStructureQueryGetDepartment(emp.departmentId),
          MembershipQueryService.membershipQueryListEmployeesByDepartment(emp.departmentId, 100),
          StatsQueryService.statsQueryGetDepartmentStats(emp.departmentId),
          MembershipQueryService.membershipQueryGetDepartmentResponsible(emp.departmentId),
        ]);

        if (deptRes.status === "fulfilled") {
          const deptData = (deptRes.value as any).department;
          setDepartmentName(deptData?.name || "Настройки отделения");
        }

        if (staffRes.status === "fulfilled") {
          const staffItems = (staffRes.value as any).items as v1EmployeeCardView[] || [];
          setStaff(staffItems);
        }

        if (statsRes.status === "fulfilled" && statsRes.value && !("code" in statsRes.value)) {
          const s = (statsRes.value as any).stats ?? {};
          const num = (v: unknown) =>
            typeof v === "number" ? v : typeof v === "string" ? Number(v) || 0 : 0;
          setStats({
            employees: num(s.employeesTotal),
            onVacation: num(s.employeesOnVacation),
          });
        }

        // Если руководитель не назначен — эндпоинт падает, просто пропускаем.
        if (headRes.status === "fulfilled") {
          const assignment = (headRes.value as any).assignment;
          const holderId = assignment?.holder?.employeeId ?? "";
          const deputyId = assignment?.deputy?.employeeId ?? "";

          setHeadId(holderId);
          setOrigHeadId(holderId);
          setOrigDeputyId(deputyId);
          if (deputyId) {
            setIsActingEnabled(true);
            setActingId(deputyId);
          }
        }
      } catch {
        notify.error("Ошибка", "Не удалось загрузить данные отделения.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session, orgId, isOrgResolving]);

  const handleSave = async () => {
    if (!departmentId) return;
    try {
      setIsSaving(true);

      const finalHead = headId || undefined;
      const finalDeputy = isActingEnabled && actingId ? actingId : undefined;

      const headChanged = origHeadId !== (finalHead ?? "");
      const deputyChanged = origDeputyId !== (finalDeputy ?? "");

      const cmd = MembershipCommandService;

      // Старого депутата убираем, если меняется head или сам депутат
      if (origDeputyId && origHeadId && (headChanged || deputyChanged)) {
        await cmd.membershipCommandRemoveDepartmentResponsibleDeputy(departmentId, origHeadId).catch(() => {});
      }

      if (headChanged) {
        if (origHeadId) {
          await cmd.membershipCommandRevokeDepartmentResponsible(departmentId, origHeadId).catch(() => {});
        }
        if (finalHead) {
          await cmd.membershipCommandAssignDepartmentResponsible(departmentId, { employeeId: finalHead });
        }
      }

      if (finalHead && finalDeputy && (headChanged || deputyChanged)) {
        await cmd.membershipCommandAssignDepartmentResponsibleDeputy(departmentId, finalHead, {
          deputyEmployeeId: finalDeputy,
        });
      }

      // Обновляем оригиналы — чтобы повторное сохранение без изменений не вызывало запросов.
      setOrigHeadId(finalHead ?? "");
      setOrigDeputyId(finalDeputy ?? "");

      notify.mutationSuccess("Изменения сохранены", "Структура управления отделения обновлена.");
    } catch (error) {
      console.error(error);
      notify.apiError(error, "Ошибка сохранения", "Проверьте соединение с сервером и попробуйте ещё раз.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSelectItem = (u: v1EmployeeCardView) => (
    <SelectItem key={u.employeeId} value={u.employeeId as string} className="cursor-pointer">
      <div className="flex flex-col sm:flex-row sm:items-center w-full max-w-60 sm:max-w-md overflow-hidden text-left">
        <span className="truncate text-sm font-normal text-foreground">
          {u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim()}
        </span>
        <span className="truncate text-muted-foreground text-xs sm:ml-2">
          ({u.position || "Сотрудник"})
        </span>
      </div>
    </SelectItem>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-64 rounded-md" /> : departmentName}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Управление настройками и доступом отделения</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          {stats ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-info/10 text-info border border-info/20 text-xs font-medium">
                <Users className="h-3.5 w-3.5" />
                <b className="text-foreground">{stats.employees}</b> сотр.
              </span>
              {stats.onVacation > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 text-warning border border-warning/20 text-xs font-medium">
                  <Plane className="h-3.5 w-3.5" />
                  <b className="text-foreground">{stats.onVacation}</b> в отпуске
                </span>
              )}
            </div>
          ) : null}
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="w-full sm:w-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить
          </Button>
        </div>
      </div>

      {stats ? (
        <div className="flex md:hidden flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-info/10 text-info border border-info/20 text-xs font-medium">
            <Users className="h-3.5 w-3.5" />
            <b className="text-foreground">{stats.employees}</b> сотр.
          </span>
          {stats.onVacation > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 text-warning border border-warning/20 text-xs font-medium">
              <Plane className="h-3.5 w-3.5" />
              <b className="text-foreground">{stats.onVacation}</b> в отпуске
            </span>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <div className="max-w-4xl space-y-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : !departmentId ? (
        <div className="max-w-4xl rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {orgId
            ? "В выбранной организации у вас нет привязки к отделению."
            : "Сначала выберите активную организацию."}
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Руководство
              </CardTitle>
              <CardDescription>Назначение ответственных лиц</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label className="text-base font-medium">Заведующий отделением</Label>
                <p className="text-sm text-muted-foreground">Имеет полный доступ к управлению заявками и графиком.</p>

                <Select value={headId} onValueChange={setHeadId}>
                  <SelectTrigger className="w-full sm:w-100 h-auto min-h-12 sm:min-h-10 py-3 sm:py-2 px-4 bg-background text-left">
                    <div className="truncate w-full pr-2">
                      <SelectValue placeholder="Выберите сотрудника" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-w-[90vw] sm:max-w-none max-h-[40vh]">
                    {staff.map(renderSelectItem)}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-card transition-colors hover:bg-accent/5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Режим замещения (И.О.)</Label>
                    <p className="text-xs text-muted-foreground max-w-[400px] leading-relaxed">
                      Включите на время отпуска или болезни, чтобы временно передать права другому сотруднику.
                    </p>
                  </div>
                  <Switch checked={isActingEnabled} onCheckedChange={setIsActingEnabled} />
                </div>

                {isActingEnabled && (
                  <div className="p-5 bg-warning/10 border border-warning/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="grid gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold text-foreground">Исполняющий обязанности</Label>
                        <Badge variant="outline" className="text-[10px] bg-warning/20 text-muted-foreground border-warning/30 px-2 py-0.5">
                          Временный доступ
                        </Badge>
                      </div>

                      <Select value={actingId} onValueChange={setActingId}>
                        <SelectTrigger className="w-full sm:w-100 h-auto min-h-12 sm:min-h-10 py-3 sm:py-2 px-4 bg-background text-left">
                          <div className="truncate w-full pr-2">
                            <SelectValue placeholder="Выберите заместителя" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-w-[90vw] sm:max-w-none max-h-[40vh]">
                          {staff.filter(u => u.employeeId !== headId).map(renderSelectItem)}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-3 items-start text-xs text-muted-foreground bg-background/50 p-3 rounded-md">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                        <p>
                          Сотрудник получит права заведующего. История действий будет сохранена под его аккаунтом.
                          Не забудьте отключить режим после возвращения основного руководителя.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
