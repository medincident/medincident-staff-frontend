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
  PowerOff
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
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/toast";
import {
  MembershipQueryServiceService,
  MembershipCommandServiceService,
  OrgStructureQueryServiceService,
} from "@/lib/api-generated";
import type { v1EmployeeCardView } from "@/lib/api-generated";
import { getBadgeColor } from "@/lib/status-helper";
import { useSession } from "next-auth/react";

export function UsersView() {
  const { data: session } = useSession();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const [users, setUsers] = useState<v1EmployeeCardView[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    givenName: "",
    familyName: "",
    email: "",
    position: "",
    clinicId: "",
    departmentId: "",
    isActive: true,
    isAdmin: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const userId = (session?.user as any)?.id;
      if (!userId) return;

      // Получаем organizationId из профиля текущего сотрудника
      const empRes = await MembershipQueryServiceService.membershipQueryServiceGetEmployee(userId);
      const emp = (empRes as any).employee as v1EmployeeCardView | undefined;
      const orgId = emp?.organizationId;
      if (!orgId) {
        notify.error("Ошибка", "Не удалось определить организацию.");
        return;
      }
      setOrganizationId(orgId);

      const [usersListRes, adminsRes] = await Promise.all([
        MembershipQueryServiceService.membershipQueryServiceSearchEmployeesByOrganization(orgId, search || undefined, 50),
        MembershipQueryServiceService.membershipQueryServiceListOrgAdmins(orgId, 100)
      ]);

      if (usersListRes && "items" in usersListRes && usersListRes.items) {
        setUsers(usersListRes.items as v1EmployeeCardView[]);
      }

      if (adminsRes && "items" in adminsRes && adminsRes.items) {
        setAdmins((adminsRes.items as any[]).map((a: any) => a.employeeId));
      }

      if (clinics.length === 0) {
        const clinicsRes = await OrgStructureQueryServiceService.orgStructureQueryServiceListClinicsByOrganization(orgId, 100);
        if (clinicsRes && "items" in clinicsRes && clinicsRes.items) {
          const builtClinics = await Promise.all((clinicsRes.items as any[]).map(async (clinic: any) => {
            const deptsRes = await OrgStructureQueryServiceService.orgStructureQueryServiceListDepartmentsByClinic(clinic.id, 100);
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
    loadData();
  }, [search, session]);

  const handleEditUser = (user: v1EmployeeCardView) => {
    setEditingUserId(user.employeeId || null);
    setFormData({
      givenName: user.firstName || "",
      familyName: user.lastName || "",
      email: user.email || "",
      position: user.position || "",
      clinicId: user.clinicId || "",
      departmentId: user.departmentId || "",
      isActive: !user.terminatedAt,
      isAdmin: admins.includes(user.employeeId || "")
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
        await MembershipCommandServiceService.membershipCommandServiceUpdateEmployeeDepartment(editingUserId, {
          departmentId: formData.departmentId
        });
      }

      if (formData.position && formData.position !== currentUser.position) {
        await MembershipCommandServiceService.membershipCommandServiceUpdateEmployeePosition(editingUserId, {
          position: formData.position
        });
      }

      const wasAdmin = admins.includes(editingUserId);
      if (organizationId) {
        if (formData.isAdmin && !wasAdmin) {
          await MembershipCommandServiceService.membershipCommandServiceAssignOrganizationAdmin(organizationId, {
            employeeId: editingUserId
          });
        } else if (!formData.isAdmin && wasAdmin) {
          await MembershipCommandServiceService.membershipCommandServiceRevokeOrganizationAdmin(organizationId, editingUserId);
        }
      }

      if (currentUser && !currentUser.terminatedAt && !formData.isActive) {
        await MembershipCommandServiceService.membershipCommandServiceTerminateEmployee(editingUserId);
      }

      notify.mutationSuccess("Успешно", "Данные пользователя обновлены.");
      setIsDialogOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      notify.mutationError("Ошибка", "Не удалось сохранить изменения.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await MembershipCommandServiceService.membershipCommandServiceTerminateEmployee(id);
        notify.mutationSuccess("Пользователь деактивирован", "Сотрудник уволен.");
        loadData();
      } else {
        notify.mutationError("Ошибка", "Невозможно восстановить уволенного сотрудника.");
      }
    } catch (e) {
      notify.mutationError("Ошибка", "Не удалось изменить статус пользователя.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Уволить сотрудника навсегда? Это действие нельзя отменить.")) {
      try {
        await MembershipCommandServiceService.membershipCommandServiceTerminateEmployee(id);
        notify.mutationSuccess("Успешно", "Сотрудник уволен.");
        loadData();
      } catch (e) {
        notify.mutationError("Ошибка удаления", "Возможно, пользователь связан с историческими данными.");
      }
    }
  };

  const availableDepts = useMemo(() => {
    return clinics.find(c => c.id === formData.clinicId)?.departments || [];
  }, [clinics, formData.clinicId]);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
        <p className="text-sm text-muted-foreground">Управление доступом и сотрудниками</p>
      </div>

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
              const isAdmin = admins.includes(user.employeeId || "");

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
                    <div className="flex flex-col">
                      <span className={`font-medium text-sm ${isAdmin ? "text-primary font-bold" : "text-foreground"}`}>
                        {isAdmin ? "Администратор" : "Сотрудник"}
                      </span>
                      <span className="text-xs text-muted-foreground">{user.position || "Должность не указана"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="font-medium text-xs text-foreground">{user.clinicName || "—"}</div>
                    {user.departmentName && <div className="text-[10px] text-muted-foreground">{user.departmentName}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
          const isAdmin = admins.includes(user.employeeId || "");

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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-foreground text-xs">{isAdmin ? "Администратор" : "Сотрудник"}</span>
                      <span className="text-[10px]">{user.position || "Должность не указана"}</span>
                    </div>
                  </div>
                  {!isAdmin && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Building className="h-3.5 w-3.5 mt-0.5" />
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs">{user.clinicName || "Не назначено"}</span>
                        {user.departmentName && <span className="text-[10px] text-muted-foreground">{user.departmentName}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => handleEditUser(user)}>
                    <Pencil className="h-3 w-3 mr-2" /> Редактировать
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
            <DialogDescription>
              {formData.email ? <b>{formData.email}</b> : "Email не указан"}
              {formData.isAdmin && <Badge variant="secondary" className="ml-2">Администратор</Badge>}
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

            {!formData.isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="grid gap-2">
                  <Label>Клиника</Label>
                  <Select
                    value={formData.clinicId}
                    onValueChange={(v) => setFormData({ ...formData, clinicId: v, departmentId: "" })}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите клинику" /></SelectTrigger>
                    <SelectContent>
                      {clinics.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Отделение</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
                    disabled={!formData.clinicId}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите отделение" /></SelectTrigger>
                    <SelectContent>
                      {availableDepts.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
