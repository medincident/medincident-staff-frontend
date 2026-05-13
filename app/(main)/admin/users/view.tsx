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
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/toast";
import {
  MembershipQueryService,
  MembershipCommandService,
  OrgStructureQueryService,
} from "@/lib/api-generated";
import type { v1EmployeeCardView, v1ZitadelUserView } from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { getBadgeColor } from "@/lib/status-helper";
import { useSession } from "next-auth/react";
import { VacationsDialog } from "./vacations-dialog";

export function UsersView() {
  const { data: session } = useSession();
  const { orgId: organizationId, isResolving: isOrgResolving } = useActiveOrgId();

  const [users, setUsers] = useState<v1EmployeeCardView[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [orgHeads, setOrgHeads] = useState<string[]>([]);
  const [orgDispatchers, setOrgDispatchers] = useState<string[]>([]);
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
        return;
      }
      const orgId = organizationId;

      // Системные админы — глобальная роль, не зависит от orgId, но всё равно
      // запрашиваем в той же пачке, чтобы UI имел один источник истины.
      const [usersListRes, adminsRes, headsRes, dispatchersRes, sysAdminsRes] = await Promise.all([
        MembershipQueryService.membershipQuerySearchEmployeesByOrganization(orgId, search || undefined, 50),
        MembershipQueryService.membershipQueryListOrgAdmins(orgId, 100),
        MembershipQueryService.membershipQueryListOrgHeads(orgId, 100),
        MembershipQueryService.membershipQueryListOrgDispatchers(orgId, 100),
        MembershipQueryService.membershipQueryListSystemAdmins(100),
      ]);

      if (usersListRes && "items" in usersListRes && usersListRes.items) {
        setUsers(usersListRes.items as v1EmployeeCardView[]);
      }

      if (adminsRes && "items" in adminsRes && adminsRes.items) {
        setAdmins((adminsRes.items as any[]).map((a: any) => a.employeeId));
      }

      if (headsRes && "items" in headsRes && headsRes.items) {
        setOrgHeads((headsRes.items as any[]).map((a: any) => a.employeeId));
      }

      if (dispatchersRes && "items" in dispatchersRes && dispatchersRes.items) {
        setOrgDispatchers((dispatchersRes.items as any[]).map((a: any) => a.employeeId));
      }

      if (sysAdminsRes && "items" in sysAdminsRes && sysAdminsRes.items) {
        setSysAdmins((sysAdminsRes.items as any[]).map((a: any) => a.zitadelUserId).filter(Boolean));
      }

      if (clinics.length === 0) {
        const clinicsRes = await OrgStructureQueryService.orgStructureQueryListClinicsByOrganization(orgId, 100);
        if (clinicsRes && "items" in clinicsRes && clinicsRes.items) {
          const builtClinics = await Promise.all((clinicsRes.items as any[]).map(async (clinic: any) => {
            const deptsRes = await OrgStructureQueryService.orgStructureQueryListDepartmentsByClinic(clinic.id, 100);
            return { ...clinic, departments: (deptsRes as any).items || [] };
          }));
          setClinics(builtClinics);
        }
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
    if (confirm("Уволить сотрудника навсегда? Это действие нельзя отменить.")) {
      try {
        await MembershipCommandService.membershipCommandTerminateEmployee(id);
        notify.mutationSuccess("Успешно", "Сотрудник уволен.");
        loadData();
      } catch (e) {
        notify.apiError(e, "Не удалось удалить");
      }
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
      // Берём с запасом — реальный лимит подстрахует пагинация (вряд ли в
      // одной организации будет 500+ незанятых аккаунтов).
      const res = await MembershipQueryService.membershipQueryListCandidatesForHire(
        organizationId,
        undefined,
        undefined,
        500,
      );
      if (res && "items" in res && Array.isArray(res.items)) {
        setHireCandidates(res.items);
      } else {
        setHireCandidates([]);
      }
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
              <Label className="text-muted-foreground">Роли в организации</Label>
              <p className="text-xs text-muted-foreground -mt-2">
                Можно назначать несколько одновременно. Каждая роль даёт свои права в системе.
              </p>

              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground">Главврач</span>
                  <p className="text-[11px] text-muted-foreground">Руководитель медицинской организации.</p>
                </div>
                <Switch
                  checked={formData.isOrgHead}
                  onCheckedChange={(v) => setFormData({ ...formData, isOrgHead: v })}
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground">Администратор</span>
                  <p className="text-[11px] text-muted-foreground">Управление пользователями, структурой и справочниками.</p>
                </div>
                <Switch
                  checked={formData.isAdmin}
                  onCheckedChange={(v) => setFormData({ ...formData, isAdmin: v })}
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground">Диспетчер</span>
                  <p className="text-[11px] text-muted-foreground">Распределяет заявки и инциденты на исполнителей.</p>
                </div>
                <Switch
                  checked={formData.isOrgDispatcher}
                  onCheckedChange={(v) => setFormData({ ...formData, isOrgDispatcher: v })}
                />
              </label>

              {editingZitadelUserId && (
                <label className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 cursor-pointer hover:bg-destructive/10">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-foreground">Системный администратор</span>
                    <p className="text-[11px] text-muted-foreground">
                      Полный доступ ко всем организациям и системным настройкам. Привязан к Zitadel-аккаунту, а не к организации.
                    </p>
                  </div>
                  <Switch
                    checked={formData.isSysAdmin}
                    onCheckedChange={(v) => setFormData({ ...formData, isSysAdmin: v })}
                  />
                </label>
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
