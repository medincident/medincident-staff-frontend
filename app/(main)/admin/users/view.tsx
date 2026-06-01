"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  Building,
  Mail,
  Briefcase,
  Ban,
  Power,
  PowerOff,
  UserPlus,
  CalendarRange,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm-dialog/store";
import {
  MembershipQueryService,
  MembershipCommandService,
  OrgStructureQueryService,
} from "@/lib/api-generated";
import type { v1EmployeeCardView, v1ZitadelUserView } from "@/lib/api-generated";
import { fetchAllPages } from "@/lib/api/paginate";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { getBadgeColor } from "@/lib/status-helper";
import { useSession } from "next-auth/react";
import { VacationsDialog } from "./vacations-dialog";

export function UsersView() {
  const { data: session } = useSession();
  const { orgId: organizationId, isResolving: isOrgResolving } = useActiveOrgId();
  const confirm = useConfirm();

  const [users, setUsers] = useState<v1EmployeeCardView[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [orgHeads, setOrgHeads] = useState<string[]>([]);
  const [orgDispatchers, setOrgDispatchers] = useState<string[]>([]);
  // Заместители орг-ролей: у каждой роли может быть один зам (или ноль).
  // Храним employeeId зама либо null.
  const [orgAdminDeputyId, setOrgAdminDeputyId] = useState<string | null>(null);
  const [orgHeadDeputyId, setOrgHeadDeputyId] = useState<string | null>(null);
  const [orgDispatcherDeputyId, setOrgDispatcherDeputyId] = useState<string | null>(null);
  // Системные администраторы привязаны к Zitadel-пользователю (роль глобальная,
  // а не к организации), поэтому здесь хранятся zitadelUserId, а не employeeId.
  const [sysAdmins, setSysAdmins] = useState<string[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  // editingZitadelUserId нужен отдельно — для Grant/RevokeSystemAdmin,
  // которые работают с zitadelUserId, а не с employeeId.
  const [editingZitadelUserId, setEditingZitadelUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    givenName: "",
    familyName: "",
    email: "",
    position: "",
    clinicId: "",
    departmentId: "",
    isActive: true,
    isAdmin: false,
    isOrgHead: false,
    isOrgDispatcher: false,
    isSysAdmin: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Vacations dialog
  const [vacationsTarget, setVacationsTarget] = useState<v1EmployeeCardView | null>(null);

  // Hire-сотрудника
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  const [hireForm, setHireForm] = useState({
    zitadelUserId: "",
    clinicId: "",
    departmentId: "",
    position: "",
  });
  const [isHiring, setIsHiring] = useState(false);
  // Кандидаты на найм — пользователи Zitadel, у которых нет employee card
  // в этой организации. Загружаем по открытию диалога; селектор подставляет
  // displayName + email, наружу отдаёт zitadelUserId.
  const [hireCandidates, setHireCandidates] = useState<v1ZitadelUserView[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (!organizationId) {
        // Sysadmin без выбранной орги — оставляем пустую заглушку, без тоста.
        setUsers([]);
        setAdmins([]);
        setOrgHeads([]);
        setOrgDispatchers([]);
        setSysAdmins([]);
        setOrgAdminDeputyId(null);
        setOrgHeadDeputyId(null);
        setOrgDispatcherDeputyId(null);
        return;
      }
      const orgId = organizationId;

      // Системные админы — глобальная роль, не зависит от orgId, но всё равно
      // запрашиваем в той же пачке, чтобы UI имел один источник истины.
      const [usersList, adminsArr, headsArr, dispatchersArr, sysAdminsArr] = await Promise.all([
        fetchAllPages<v1EmployeeCardView>((cursor) =>
          MembershipQueryService.membershipQuerySearchEmployeesByOrganization(orgId, search || undefined, 200, cursor),
        ),
        fetchAllPages<any>((cursor) =>
          MembershipQueryService.membershipQueryListOrgAdmins(orgId, 200, cursor),
        ),
        fetchAllPages<any>((cursor) =>
          MembershipQueryService.membershipQueryListOrgHeads(orgId, 200, cursor),
        ),
        fetchAllPages<any>((cursor) =>
          MembershipQueryService.membershipQueryListOrgDispatchers(orgId, 200, cursor),
        ),
        fetchAllPages<any>((cursor) =>
          MembershipQueryService.membershipQueryListSystemAdmins(200, cursor),
        ),
      ]);

      setUsers(usersList);

      // ListOrg{Admins,Heads,Dispatchers} возвращают RoleAssignment{ holder, deputy }
      // — где employeeId зашит внутри holder. Раньше брали a.employeeId напрямую,
      // из-за чего все ряды получали undefined и в UI у каждого светилось «Сотрудник».
      setAdmins(adminsArr.map((a: any) => a.holder?.employeeId).filter(Boolean));
      // У орг-роли может быть один заместитель: берём первый с deputy.
      const adminWithDeputy = adminsArr.find((a: any) => a.deputy?.employeeId);
      setOrgAdminDeputyId(adminWithDeputy?.deputy?.employeeId ?? null);

      setOrgHeads(headsArr.map((a: any) => a.holder?.employeeId).filter(Boolean));
      const headWithDeputy = headsArr.find((a: any) => a.deputy?.employeeId);
      setOrgHeadDeputyId(headWithDeputy?.deputy?.employeeId ?? null);

      setOrgDispatchers(dispatchersArr.map((a: any) => a.holder?.employeeId).filter(Boolean));
      const dispWithDeputy = dispatchersArr.find((a: any) => a.deputy?.employeeId);
      setOrgDispatcherDeputyId(dispWithDeputy?.deputy?.employeeId ?? null);

      setSysAdmins(sysAdminsArr.map((a: any) => a.zitadelUserId).filter(Boolean));

      if (clinics.length === 0) {
        const clinicsList = await fetchAllPages<any>((cursor) =>
          OrgStructureQueryService.orgStructureQueryListClinicsByOrganization(orgId, 200, cursor),
        );
        const builtClinics = await Promise.all(clinicsList.map(async (clinic: any) => {
          const departments = await fetchAllPages<any>((cursor) =>
            OrgStructureQueryService.orgStructureQueryListDepartmentsByClinic(clinic.id, 200, cursor),
          );
          return { ...clinic, departments };
        }));
        setClinics(builtClinics);
      }
    } catch (error) {
      console.error("Failed to load users data:", error);
      notify.error("Ошибка", "Не удалось загрузить данные пользователей.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOrgResolving) return;
    loadData();
  }, [search, organizationId, isOrgResolving]);

  const handleEditUser = (user: v1EmployeeCardView) => {
    setEditingUserId(user.employeeId || null);
    setEditingZitadelUserId(user.zitadelUserId || null);
    setFormData({
      givenName: user.firstName || "",
      familyName: user.lastName || "",
      email: user.email || "",
      position: user.position || "",
      clinicId: user.clinicId || "",
      departmentId: user.departmentId || "",
      isActive: !user.terminatedAt,
      isAdmin: admins.includes(user.employeeId || ""),
      isOrgHead: orgHeads.includes(user.employeeId || ""),
      isOrgDispatcher: orgDispatchers.includes(user.employeeId || ""),
      isSysAdmin: !!user.zitadelUserId && sysAdmins.includes(user.zitadelUserId),
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUserId) return;

    setIsSaving(true);
    try {
      const currentUser = users.find(u => u.employeeId === editingUserId);
      if (!currentUser) return;

      if (formData.departmentId && formData.departmentId !== currentUser.departmentId) {
        await MembershipCommandService.membershipCommandUpdateEmployeeDepartment(editingUserId, {
          departmentId: formData.departmentId
        });
      }

      if (formData.position && formData.position !== currentUser.position) {
        await MembershipCommandService.membershipCommandUpdateEmployeePosition(editingUserId, {
          position: formData.position
        });
      }

      if (organizationId) {
        const wasAdmin = admins.includes(editingUserId);
        const wasHead = orgHeads.includes(editingUserId);
        const wasDispatcher = orgDispatchers.includes(editingUserId);

        if (formData.isAdmin && !wasAdmin) {
          await MembershipCommandService.membershipCommandAssignOrganizationAdmin(organizationId, {
            employeeId: editingUserId,
          });
        } else if (!formData.isAdmin && wasAdmin) {
          await MembershipCommandService.membershipCommandRevokeOrganizationAdmin(organizationId, editingUserId);
        }

        if (formData.isOrgHead && !wasHead) {
          await MembershipCommandService.membershipCommandAssignOrganizationHead(organizationId, {
            employeeId: editingUserId,
          });
        } else if (!formData.isOrgHead && wasHead) {
          await MembershipCommandService.membershipCommandRevokeOrganizationHead(organizationId, editingUserId);
        }

        if (formData.isOrgDispatcher && !wasDispatcher) {
          await MembershipCommandService.membershipCommandAssignOrganizationDispatcher(organizationId, {
            employeeId: editingUserId,
          });
        } else if (!formData.isOrgDispatcher && wasDispatcher) {
          await MembershipCommandService.membershipCommandRevokeOrganizationDispatcher(organizationId, editingUserId);
        }
      }

      // SystemAdmin привязан к Zitadel-учётке, поэтому отдельная ветка вне
      // блока организации. Если у сотрудника нет zitadelUserId — пропускаем,
      // иначе бэк вернёт zitadel_user_not_found.
      if (editingZitadelUserId) {
        const wasSysAdmin = sysAdmins.includes(editingZitadelUserId);
        if (formData.isSysAdmin && !wasSysAdmin) {
          await MembershipCommandService.membershipCommandGrantSystemAdmin({
            zitadelUserId: editingZitadelUserId,
          });
        } else if (!formData.isSysAdmin && wasSysAdmin) {
          await MembershipCommandService.membershipCommandRevokeSystemAdmin(editingZitadelUserId);
        }
      }

      if (currentUser && !currentUser.terminatedAt && !formData.isActive) {
        await MembershipCommandService.membershipCommandTerminateEmployee(editingUserId);
      }

      notify.mutationSuccess("Успешно", "Данные пользователя обновлены.");
      setIsDialogOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось сохранить изменения");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await MembershipCommandService.membershipCommandTerminateEmployee(id);
        notify.mutationSuccess("Пользователь деактивирован", "Сотрудник уволен.");
        loadData();
      } else {
        notify.error("Невозможно восстановить уволенного сотрудника", "Создайте новую запись.");
      }
    } catch (e) {
      notify.apiError(e, "Не удалось изменить статус пользователя");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const ok = await confirm({
      title: "Уволить сотрудника навсегда?",
      description: "Это действие нельзя отменить.",
      confirmLabel: "Уволить",
      destructive: true,
    });
    if (!ok) return;
    try {
      await MembershipCommandService.membershipCommandTerminateEmployee(id);
      notify.mutationSuccess("Успешно", "Сотрудник уволен.");
      loadData();
    } catch (e) {
      notify.apiError(e, "Не удалось удалить");
    }
  };

  const availableDepts = useMemo(() => {
    return clinics.find(c => c.id === formData.clinicId)?.departments || [];
  }, [clinics, formData.clinicId]);

  const hireAvailableDepts = useMemo(() => {
    return clinics.find(c => c.id === hireForm.clinicId)?.departments || [];
  }, [clinics, hireForm.clinicId]);

  const openHireDialog = async () => {
    setHireForm({ zitadelUserId: "", clinicId: "", departmentId: "", position: "" });
    setIsHireDialogOpen(true);
    if (!organizationId) return;
    setIsLoadingCandidates(true);
    try {
      // Тянем всех кандидатов (полный список нужен для выпадающего селекта найма).
      // Сигнатура нестандартная: (orgId, query, after, limit) — after третий.
      const items = await fetchAllPages<v1ZitadelUserView>((cursor) =>
        MembershipQueryService.membershipQueryListCandidatesForHire(
          organizationId,
          undefined,
          cursor,
          200,
        ),
      );
      setHireCandidates(items);
    } catch (e) {
      notify.apiError(e, "Не удалось загрузить список кандидатов");
      setHireCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleHire = async () => {
    if (!hireForm.zitadelUserId.trim() || !hireForm.departmentId) {
      notify.error("Заполните поля", "Нужны Zitadel ID пользователя и отделение.");
      return;
    }
    setIsHiring(true);
    try {
      await MembershipCommandService.membershipCommandHireEmployee({
        zitadelUserId: hireForm.zitadelUserId.trim(),
        departmentId: hireForm.departmentId,
        position: hireForm.position.trim() || undefined,
      });
      notify.mutationSuccess("Сотрудник принят", "Учётная запись связана с отделением.");
      setIsHireDialogOpen(false);
      loadData();
    } catch (e) {
      // Бэк теперь возвращает осмысленные code/message — apiError сам
      // распакует "employee_already_hired", "zitadel_user_not_found",
      // "validation_failed" с violations и т.д.
      notify.apiError(e, "Не удалось принять сотрудника");
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
          <p className="text-sm text-muted-foreground">Управление доступом и сотрудниками</p>
        </div>
        <Button onClick={openHireDialog} disabled={!organizationId} className="shrink-0">
          <UserPlus className="mr-2 h-4 w-4" />
          Принять сотрудника
        </Button>
      </div>

      {!isOrgResolving && !organizationId && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Сначала выберите активную организацию, чтобы управлять её сотрудниками.
        </div>
      )}

      <div className="relative h-10">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Поиск по ФИО..."
          className="pl-9 bg-background w-full h-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b">
              <TableHead className="text-muted-foreground">Сотрудник</TableHead>
              <TableHead className="text-muted-foreground">Статус</TableHead>
              <TableHead className="text-muted-foreground">Роль / Должность</TableHead>
              <TableHead className="text-muted-foreground">Место работы</TableHead>
              <TableHead className="text-right text-muted-foreground">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && users.length === 0 && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skel-${i}`} className="border-b">
                <TableCell><div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-32" /></div></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></TableCell>
                <TableCell><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></TableCell>
                <TableCell className="text-right"><div className="flex justify-end gap-1"><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
              </TableRow>
            ))}

            {!isLoading && users.map(user => {
              const isActive = !user.terminatedAt;
              const empId = user.employeeId || "";
              const userRoles: string[] = [];
              if (orgHeads.includes(empId)) userRoles.push("Главврач");
              if (admins.includes(empId)) userRoles.push("Администратор");
              if (orgDispatchers.includes(empId)) userRoles.push("Диспетчер");

              return (
                <TableRow key={user.employeeId} className={`border-b ${!isActive ? "opacity-60 bg-muted/20" : ""}`}>
                  <TableCell>
                    <div className="font-medium text-foreground">{user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim()}</div>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email || "Нет email"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getBadgeColor(isActive ? "active" : "inactive")}>
                      {isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                      {isActive ? "Активен" : "Уволен"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {userRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map((r) => (
                            <Badge key={r} variant="secondary" className="text-[10px] h-5 px-1.5">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Сотрудник</span>
                      )}
                      <span className="text-xs text-muted-foreground">{user.position || "Должность не указана"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="font-medium text-xs text-foreground">{user.clinicName || "—"}</div>
                    {user.departmentName && <div className="text-[10px] text-muted-foreground">{user.departmentName}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        title="Отпуска"
                        onClick={() => setVacationsTarget(user)}
                      >
                        <CalendarRange className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => toggleUserStatus(user.employeeId as string, isActive)}>
                        {isActive ? <PowerOff className="h-4 w-4 text-warning" /> : <Power className="h-4 w-4 text-emerald-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteUser(user.employeeId as string)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {isLoading && users.length === 0 && Array.from({ length: 3 }).map((_, i) => (
          <Card key={`skel-mob-${i}`} className="overflow-hidden p-0 border">
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}

        {!isLoading && users.map(user => {
          const isActive = !user.terminatedAt;
          const empId = user.employeeId || "";
          const userRoles: string[] = [];
          if (orgHeads.includes(empId)) userRoles.push("Главврач");
          if (admins.includes(empId)) userRoles.push("Администратор");
          if (orgDispatchers.includes(empId)) userRoles.push("Диспетчер");

          return (
            <Card key={user.employeeId} className={`overflow-hidden p-0 border ${!isActive ? "opacity-60 bg-muted/20" : "bg-card"}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-semibold text-foreground text-sm">
                    {user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim()}
                  </div>
                  <Badge variant="outline" className={`${getBadgeColor(isActive ? "active" : "inactive")} whitespace-nowrap`}>
                    {isActive ? "Активен" : "Уволен"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {userRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {userRoles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-[10px] h-5 px-1.5">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-foreground text-xs">
                        {user.position || "Должность не указана"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Building className="h-3.5 w-3.5 mt-0.5" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs">{user.clinicName || "Не назначено"}</span>
                      {user.departmentName && <span className="text-[10px] text-muted-foreground">{user.departmentName}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => handleEditUser(user)}>
                    <Pencil className="h-3 w-3 mr-2" /> Редактировать
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setVacationsTarget(user)}>
                    <CalendarRange className="h-3 w-3 mr-2" /> Отпуска
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройка сотрудника</DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap">
              {formData.email ? <b>{formData.email}</b> : "Email не указан"}
              {formData.isSysAdmin && <Badge variant="destructive">Sys Admin</Badge>}
              {formData.isOrgHead && <Badge variant="secondary">Главврач</Badge>}
              {formData.isAdmin && <Badge variant="secondary">Администратор</Badge>}
              {formData.isOrgDispatcher && <Badge variant="secondary">Диспетчер</Badge>}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label>Статус аккаунта</Label>
              <Select
                value={formData.isActive ? "active" : "deactivated"}
                onValueChange={(v) => setFormData({ ...formData, isActive: v === "active" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="deactivated">Деактивирован</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Имя</Label>
                <Input value={formData.givenName} onChange={(e) => setFormData({ ...formData, givenName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Фамилия</Label>
                <Input value={formData.familyName} onChange={(e) => setFormData({ ...formData, familyName: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2 border-t pt-4">
              <Label className="text-muted-foreground">Трудоустройство</Label>
              <p className="text-xs text-muted-foreground mb-2">Где работает сотрудник и какую должность занимает</p>
              <Label>Должность</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Например: Медбрат"
              />
            </div>

            <div className="grid gap-3 border-t pt-4">
              <div>
                <Label className="text-muted-foreground">Роли в организации</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Можно назначить несколько одновременно — клик по чипу переключает роль.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <RoleChip
                  label="Главврач"
                  active={formData.isOrgHead}
                  onClick={() => setFormData({ ...formData, isOrgHead: !formData.isOrgHead })}
                />
                <RoleChip
                  label="Администратор"
                  active={formData.isAdmin}
                  onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })}
                />
                <RoleChip
                  label="Диспетчер"
                  active={formData.isOrgDispatcher}
                  onClick={() => setFormData({ ...formData, isOrgDispatcher: !formData.isOrgDispatcher })}
                />
                {editingZitadelUserId && (
                  <RoleChip
                    label="Системный администратор"
                    active={formData.isSysAdmin}
                    onClick={() => setFormData({ ...formData, isSysAdmin: !formData.isSysAdmin })}
                    variant="destructive"
                  />
                )}
              </div>
              {(formData.isOrgHead || formData.isAdmin || formData.isOrgDispatcher) && (
                <DeputyManager
                  organizationId={organizationId}
                  holderEmployeeId={editingUserId}
                  isOrgHead={formData.isOrgHead}
                  isOrgAdmin={formData.isAdmin}
                  isOrgDispatcher={formData.isOrgDispatcher}
                  currentDeputies={{
                    head: orgHeads.includes(editingUserId ?? "") ? orgHeadDeputyId : null,
                    admin: admins.includes(editingUserId ?? "") ? orgAdminDeputyId : null,
                    dispatcher: orgDispatchers.includes(editingUserId ?? "") ? orgDispatcherDeputyId : null,
                  }}
                  candidates={users}
                  onChanged={loadData}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="grid gap-2">
                <Label>Клиника</Label>
                <SearchableSelect
                  options={clinics.map((c) => ({ value: c.id, label: c.name }))}
                  value={formData.clinicId}
                  onChange={(v) => setFormData({ ...formData, clinicId: v, departmentId: "" })}
                  placeholder="Выберите клинику"
                />
              </div>
              <div className="grid gap-2">
                <Label>Отделение</Label>
                <SearchableSelect
                  options={availableDepts.map((d: any) => ({ value: d.id, label: d.name }))}
                  value={formData.departmentId}
                  onChange={(v) => setFormData({ ...formData, departmentId: v })}
                  placeholder={formData.clinicId ? "Выберите отделение" : "Сначала выберите клинику"}
                  disabled={!formData.clinicId}
                  emptyMessage="В клинике нет отделений"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHireDialogOpen} onOpenChange={setIsHireDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Принять сотрудника</DialogTitle>
            <DialogDescription>
              Свяжите учётную запись Zitadel с отделением. Пользователь должен быть уже создан в Zitadel — здесь только привязка.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Пользователь Zitadel</Label>
              {isLoadingCandidates ? (
                <Skeleton className="h-9 w-full rounded-md" />
              ) : (
                <SearchableSelect
                  options={hireCandidates.map((u) => ({
                    value: u.zitadelUserId || "",
                    label:
                      u.displayName ||
                      `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                      u.email ||
                      u.zitadelUserId ||
                      "—",
                    description: u.email,
                  }))}
                  value={hireForm.zitadelUserId}
                  onChange={(v) => setHireForm({ ...hireForm, zitadelUserId: v })}
                  placeholder={
                    hireCandidates.length === 0
                      ? "Нет свободных аккаунтов в Zitadel"
                      : "Выберите пользователя..."
                  }
                  emptyMessage="Никого не найдено"
                  disabled={hireCandidates.length === 0}
                />
              )}
              <p className="text-[11px] text-muted-foreground">
                Показаны только пользователи Zitadel, ещё не нанятые в эту организацию.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Клиника</Label>
                <SearchableSelect
                  options={clinics.map((c) => ({ value: c.id, label: c.name }))}
                  value={hireForm.clinicId}
                  onChange={(v) => setHireForm({ ...hireForm, clinicId: v, departmentId: "" })}
                  placeholder="Выберите клинику"
                />
              </div>
              <div className="grid gap-2">
                <Label>Отделение</Label>
                <SearchableSelect
                  options={hireAvailableDepts.map((d: any) => ({ value: d.id, label: d.name }))}
                  value={hireForm.departmentId}
                  onChange={(v) => setHireForm({ ...hireForm, departmentId: v })}
                  placeholder={hireForm.clinicId ? "Выберите отделение" : "Сначала выберите клинику"}
                  disabled={!hireForm.clinicId}
                  emptyMessage="В клинике нет отделений"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Должность (необязательно)</Label>
              <Input
                value={hireForm.position}
                onChange={(e) => setHireForm({ ...hireForm, position: e.target.value })}
                placeholder="Например: Медбрат"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHireDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleHire}
              disabled={isHiring || !hireForm.zitadelUserId.trim() || !hireForm.departmentId}
            >
              {isHiring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Принять
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VacationsDialog
        open={!!vacationsTarget}
        onOpenChange={(open) => !open && setVacationsTarget(null)}
        employeeId={vacationsTarget?.employeeId ?? null}
        employeeName={
          vacationsTarget?.displayName ||
          `${vacationsTarget?.firstName ?? ""} ${vacationsTarget?.lastName ?? ""}`.trim() ||
          undefined
        }
      />
    </div>
  );
}

function RoleChip({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "destructive";
}) {
  const isDestructive = variant === "destructive";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? isDestructive
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-primary text-primary-foreground border-primary"
          : isDestructive
            ? "bg-card text-destructive border-destructive/40 hover:bg-destructive/10"
            : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active
            ? "bg-primary-foreground"
            : isDestructive
              ? "bg-destructive/30"
              : "bg-muted-foreground/30",
        )}
      />
      {label}
    </button>
  );
}

// Управление заместителями орг-ролей. Deputy в Zitadel привязан к КОНКРЕТНОМУ
// holder'у (URL /admins/{employeeId}/deputy), поэтому редактируется только
// в карточке самого holder'а: показываем по строке на каждую активную роль.
function DeputyManager({
  organizationId,
  holderEmployeeId,
  isOrgHead,
  isOrgAdmin,
  isOrgDispatcher,
  currentDeputies,
  candidates,
  onChanged,
}: {
  organizationId: string | null;
  holderEmployeeId: string | null;
  isOrgHead: boolean;
  isOrgAdmin: boolean;
  isOrgDispatcher: boolean;
  currentDeputies: { head: string | null; admin: string | null; dispatcher: string | null };
  candidates: v1EmployeeCardView[];
  onChanged: () => void;
}) {
  const options = useMemo(
    () =>
      candidates
        .filter((u) => u.employeeId && u.employeeId !== holderEmployeeId && !u.terminatedAt)
        .map((u) => ({
          value: u.employeeId!,
          label:
            u.displayName ||
            `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
            u.email ||
            u.employeeId!,
        })),
    [candidates, holderEmployeeId],
  );

  if (!organizationId || !holderEmployeeId) return null;

  return (
    <div className="grid gap-3 border-t pt-3 mt-1">
      <Label className="text-muted-foreground">Заместители</Label>
      {isOrgHead && (
        <DeputyRow
          label="И.о. главврача"
          currentId={currentDeputies.head}
          options={options}
          onAssign={(deputyId) =>
            MembershipCommandService.membershipCommandAssignOrganizationHeadDeputy(
              organizationId,
              holderEmployeeId,
              { deputyEmployeeId: deputyId },
            )
          }
          onRemove={() =>
            MembershipCommandService.membershipCommandRemoveOrganizationHeadDeputy(
              organizationId,
              holderEmployeeId,
            )
          }
          onChanged={onChanged}
        />
      )}
      {isOrgAdmin && (
        <DeputyRow
          label="И.о. администратора"
          currentId={currentDeputies.admin}
          options={options}
          onAssign={(deputyId) =>
            MembershipCommandService.membershipCommandAssignOrganizationAdminDeputy(
              organizationId,
              holderEmployeeId,
              { deputyEmployeeId: deputyId },
            )
          }
          onRemove={() =>
            MembershipCommandService.membershipCommandRemoveOrganizationAdminDeputy(
              organizationId,
              holderEmployeeId,
            )
          }
          onChanged={onChanged}
        />
      )}
      {isOrgDispatcher && (
        <DeputyRow
          label="И.о. диспетчера"
          currentId={currentDeputies.dispatcher}
          options={options}
          onAssign={(deputyId) =>
            MembershipCommandService.membershipCommandAssignOrganizationDispatcherDeputy(
              organizationId,
              holderEmployeeId,
              { deputyEmployeeId: deputyId },
            )
          }
          onRemove={() =>
            MembershipCommandService.membershipCommandRemoveOrganizationDispatcherDeputy(
              organizationId,
              holderEmployeeId,
            )
          }
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

function DeputyRow({
  label,
  currentId,
  options,
  onAssign,
  onRemove,
  onChanged,
}: {
  label: string;
  currentId: string | null;
  options: { value: string; label: string }[];
  onAssign: (deputyId: string) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
  onChanged: () => void;
}) {
  const [selected, setSelected] = useState<string>(currentId ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelected(currentId ?? "");
  }, [currentId]);

  const handleAssign = async () => {
    if (!selected || selected === currentId) return;
    setBusy(true);
    try {
      await onAssign(selected);
      notify.mutationSuccess("Заместитель назначен", "");
      onChanged();
    } catch (e) {
      notify.apiError(e, "Не удалось назначить заместителя");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await onRemove();
      notify.mutationSuccess("Заместитель снят", "");
      onChanged();
    } catch (e) {
      notify.apiError(e, "Не удалось снять заместителя");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] items-end">
      <div className="grid gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <SearchableSelect
          options={options}
          value={selected}
          onChange={setSelected}
          placeholder="Не назначен"
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy || !selected || selected === currentId}
        onClick={handleAssign}
      >
        {currentId ? "Сменить" : "Назначить"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        disabled={busy || !currentId}
        onClick={handleRemove}
      >
        Снять
      </Button>
    </div>
  );
}
