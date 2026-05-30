"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Building,
  MapPin,
  Search,
  Stethoscope,
  MoreVertical,
  Pencil,
  Trash2,
  User as UserIcon,
  Users,
  UserCog,
  Loader2,
  Power,
  PowerOff,
  Palmtree,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm-dialog/store";
import {
  MembershipQueryService,
  MembershipCommandService,
  OrgStructureQueryService,
  OrgStructureCommandService,
  StatsQueryService,
} from "@/lib/api-generated";
import type { v1EmployeeCardView } from "@/lib/api-generated";
import { cleanText } from "@/lib/text";
import { useActiveOrgId } from "@/lib/auth/active-org-context";

// Собирает опции для SearchableSelect руководителя/заместителя:
// • первый пункт «Не назначен»
// • дальше — кандидаты из бэка (ListCandidatesFor*)
// • если уже назначенный сотрудник (currentId) не попал в кандидатов
//   (бэк его исключает, потому что роль уже занята), добавляем его сверху
//   списка, иначе SearchableSelect покажет пустое поле
// • excludeId — id, который нужно исключить (например, чтобы в селекторе
//   заместителя нельзя было выбрать того же сотрудника, что в селекторе главврача)
function buildHeadOptions(
  candidates: v1EmployeeCardView[],
  fallback: v1EmployeeCardView[],
  currentId?: string,
  excludeId?: string,
): Array<{ value: string; label: string }> {
  const nameOf = (u: v1EmployeeCardView) =>
    u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "—";
  const map = new Map<string, string>();
  for (const u of candidates) {
    if (u.employeeId) map.set(u.employeeId, nameOf(u));
  }
  if (currentId && currentId !== "none" && !map.has(currentId)) {
    const found = fallback.find((u) => u.employeeId === currentId);
    if (found) map.set(currentId, `${nameOf(found)} (текущий)`);
  }
  const items: Array<{ value: string; label: string }> = [
    { value: "none", label: "Не назначен" },
  ];
  for (const [value, label] of map) {
    if (excludeId && value === excludeId) continue;
    items.push({ value, label });
  }
  return items;
}

export function StructureView() {
  const { orgId: selectedOrgId, isResolving: isOrgsLoading } = useActiveOrgId();
  const confirm = useConfirm();

  const [clinics, setClinics] = useState<any[]>([]);
  const [users, setUsers] = useState<v1EmployeeCardView[]>([]);
  // Кандидаты на роль главврача/заведующего для конкретной открытой
  // сущности. Бэкенд сам отсекает тех, кого нельзя назначить (уже занимает
  // роль, не в нужной клинике/отделении и т.п.), поэтому таргетный запрос
  // лучше общего users-списка.
  const [headCandidates, setHeadCandidates] = useState<v1EmployeeCardView[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [isClinicDialogOpen, setIsClinicDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<{
    id?: string;
    parentId?: string;
    oldHeadId?: string;
    oldDeputyId?: string;
  } | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHeadId, setNewHeadId] = useState<string>("none");
  const [newDeputyId, setNewDeputyId] = useState<string>("none");
  const [targetClinicId, setTargetClinicId] = useState<string | null>(null);

  const loadData = async () => {
    if (!selectedOrgId) return;

    try {
      setIsLoading(true);

      const usersRes = await MembershipQueryService.membershipQueryListEmployeesByOrganization(selectedOrgId, 100);
      setUsers((usersRes as any).items || []);

      const clinicsRes = await OrgStructureQueryService.orgStructureQueryListClinicsByOrganization(selectedOrgId, 100);
      const clinicsItems = (clinicsRes as any).items || [];

      const filteredClinics = search
        ? clinicsItems.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
        : clinicsItems;

      const builtClinics = await Promise.all(filteredClinics.map(async (clinic: any) => {
        const [deptsRes, cHeadRes, statsRes] = await Promise.all([
          OrgStructureQueryService.orgStructureQueryListDepartmentsByClinic(clinic.id, 100),
          MembershipQueryService.membershipQueryGetClinicHead(clinic.id).catch(() => null),
          StatsQueryService.statsQueryGetClinicStats(clinic.id).catch(() => null),
        ]);

        const deptsItems = (deptsRes as any).items || [];
        const cHeadAssignment = (cHeadRes as any)?.assignment;
        const clinicHeadId = cHeadAssignment?.holder?.employeeId;
        const clinicDeputyId = cHeadAssignment?.deputy?.employeeId;
        const stats = (statsRes as any)?.stats ?? null;

        const builtDepts = await Promise.all(deptsItems.map(async (dept: any) => {
          const dHeadRes = await MembershipQueryService.membershipQueryGetDepartmentResponsible(dept.id).catch(() => null);
          const dHeadAssignment = (dHeadRes as any)?.assignment;
          return {
            ...dept,
            headId: dHeadAssignment?.holder?.employeeId,
            deputyId: dHeadAssignment?.deputy?.employeeId,
          };
        }));

        return {
          ...clinic,
          headId: clinicHeadId,
          deputyId: clinicDeputyId,
          stats,
          departments: builtDepts,
        };
      }));

      setClinics(builtClinics);
    } catch (error) {
      console.error("Failed to load structure:", error);
      notify.error("Ошибка", "Не удалось загрузить структуру клиник.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedOrgId, search]);

  const getUserName = (employeeId?: string) => {
    if (!employeeId) return null;
    const user = users.find(u => u.employeeId === employeeId);
    return user ? (user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim()) : null;
  };

  const syncResponsible = async (
    targetId: string,
    oldHeadId: string | undefined,
    newHeadId: string,
    oldDeputyId: string | undefined,
    newDeputyId: string,
    type: "clinic" | "department",
  ) => {
    const finalHead = newHeadId === "none" ? undefined : newHeadId;
    const finalDeputy = newDeputyId === "none" ? undefined : newDeputyId;

    const cmd = MembershipCommandService;

    // Если меняется head или нужно очистить депутата — сначала снимаем старого депутата
    // (он привязан к ID старого head: /heads/{oldHeadId}/deputy)
    const headChanged = oldHeadId !== finalHead;
    const deputyChanged = oldDeputyId !== finalDeputy;

    if (oldDeputyId && oldHeadId && (headChanged || deputyChanged)) {
      if (type === "clinic") {
        await cmd.membershipCommandRemoveClinicHeadDeputy(targetId, oldHeadId).catch(() => {});
      } else {
        await cmd.membershipCommandRemoveDepartmentResponsibleDeputy(targetId, oldHeadId).catch(() => {});
      }
    }

    if (headChanged) {
      if (type === "clinic") {
        if (oldHeadId) await cmd.membershipCommandRevokeClinicHead(targetId, oldHeadId).catch(() => {});
        if (finalHead) await cmd.membershipCommandAssignClinicHead(targetId, { employeeId: finalHead }).catch(() => {});
      } else {
        if (oldHeadId) await cmd.membershipCommandRevokeDepartmentResponsible(targetId, oldHeadId).catch(() => {});
        if (finalHead) await cmd.membershipCommandAssignDepartmentResponsible(targetId, { employeeId: finalHead }).catch(() => {});
      }
    }

    // Назначаем нового депутата только если есть head и депутат, и состояние изменилось
    if (finalHead && finalDeputy && (headChanged || deputyChanged)) {
      if (type === "clinic") {
        await cmd.membershipCommandAssignClinicHeadDeputy(targetId, finalHead, { deputyEmployeeId: finalDeputy }).catch(() => {});
      } else {
        await cmd.membershipCommandAssignDepartmentResponsibleDeputy(targetId, finalHead, { deputyEmployeeId: finalDeputy }).catch(() => {});
      }
    }
  };

  const openClinicModal = async (clinic?: any) => {
    if (clinic) {
      setEditingItem({ id: clinic.id, oldHeadId: clinic.headId, oldDeputyId: clinic.deputyId });
      setNewName(clinic.name);
      setNewDescription(clinic.description || "");
      setNewAddress(clinic.physicalAddress || "");
      setNewHeadId(clinic.headId || "none");
      setNewDeputyId(clinic.deputyId || "none");
      setIsClinicDialogOpen(true);
      // Подгружаем кандидатов на главврача этой клиники. На время загрузки
      // в селекторе будет скелетон.
      setIsLoadingCandidates(true);
      setHeadCandidates([]);
      try {
        const res = await MembershipQueryService.membershipQueryListCandidatesForClinicHead(
          clinic.id,
          undefined,
          undefined,
          200,
        );
        if (res && "items" in res && Array.isArray(res.items)) {
          setHeadCandidates(res.items as v1EmployeeCardView[]);
        }
      } catch (e) {
        notify.apiError(e, "Не удалось загрузить список кандидатов");
      } finally {
        setIsLoadingCandidates(false);
      }
    } else {
      setEditingItem(null);
      setNewName("");
      setNewDescription("");
      setNewAddress("");
      setNewHeadId("none");
      setNewDeputyId("none");
      setHeadCandidates([]);
      setIsClinicDialogOpen(true);
    }
  };

  const saveClinic = async () => {
    // Бэк-валидация: name min=2/max=256, address.text min=4/max=128,
    // description omitnil min=8/max=2048, всё no_extra_ws → триммим.
    const name = cleanText(newName) ?? "";
    const address = cleanText(newAddress) ?? "";
    const description = cleanText(newDescription);
    if (name.length < 2 || address.length < 4 || !selectedOrgId) {
      if (selectedOrgId) {
        notify.error("Проверьте поля", "Название (≥ 2) и адрес (≥ 4) обязательны.");
      }
      return;
    }
    if (description !== undefined && description.length < 8) {
      notify.error("Проверьте описание", "Описание должно быть ≥ 8 символов либо пустым.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await OrgStructureCommandService.orgStructureCommandUpdateClinicDetails(editingItem.id, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
        await OrgStructureCommandService.orgStructureCommandUpdateClinicPhysicalAddress(editingItem.id, {
          physicalAddress: { text: address },
        });
        await syncResponsible(
          editingItem.id,
          editingItem.oldHeadId,
          newHeadId,
          editingItem.oldDeputyId,
          newDeputyId,
          "clinic",
        );
      } else {
        const newClinicRes = await OrgStructureCommandService.orgStructureCommandCreateClinic(selectedOrgId, {
          name,
          ...(description !== undefined ? { description } : {}),
          physicalAddress: { text: address },
        });
        const newClinicId = (newClinicRes as any).id;
        if (newHeadId !== "none" && newClinicId) {
          await MembershipCommandService.membershipCommandAssignClinicHead(newClinicId, { employeeId: newHeadId });
          if (newDeputyId !== "none") {
            await MembershipCommandService.membershipCommandAssignClinicHeadDeputy(newClinicId, newHeadId, {
              deputyEmployeeId: newDeputyId,
            }).catch(() => {});
          }
        }
      }
      notify.mutationSuccess("Успешно", "Клиника сохранена.");
      setIsClinicDialogOpen(false);
      loadData();
    } catch (e) {
      notify.apiError(e, "Не удалось сохранить клинику");
    } finally {
      setIsSaving(false);
    }
  };

  // isActive=true означает "сейчас активна" → действие — деактивировать.
  const toggleClinicStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        const ok = await confirm({
          title: "Деактивировать клинику?",
          description: "Клиника станет недоступна для работы. Данные сохранятся, можно вернуть позже.",
          confirmLabel: "Деактивировать",
        });
        if (!ok) return;
        await OrgStructureCommandService.orgStructureCommandDeactivateClinic(id, {});
        notify.mutationSuccess("Клиника деактивирована", "");
      } else {
        await OrgStructureCommandService.orgStructureCommandActivateClinic(id, {});
        notify.mutationSuccess("Клиника активирована", "");
      }
      void loadData();
    } catch (e) {
      notify.apiError(e, isActive ? "Не удалось деактивировать клинику" : "Не удалось активировать клинику");
    }
  };

  const deleteClinic = async (id: string) => {
    const ok = await confirm({
      title: "Удалить клинику безвозвратно?",
      description: "Действие необратимо. Если у клиники есть отделения/сотрудники/инциденты — бэк отклонит удаление.",
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (!ok) return;
    try {
      await OrgStructureCommandService.orgStructureCommandDeleteClinic(id);
      notify.mutationSuccess("Клиника удалена", "");
      void loadData();
    } catch (e) {
      notify.apiError(e, "Не удалось удалить клинику");
    }
  };

  const openDeptModal = async (clinicId: string, dept?: any) => {
    setTargetClinicId(clinicId);
    if (dept) {
      setEditingItem({ id: dept.id, parentId: clinicId, oldHeadId: dept.headId, oldDeputyId: dept.deputyId });
      setNewName(dept.name);
      setNewDescription(dept.description || "");
      setNewHeadId(dept.headId || "none");
      setNewDeputyId(dept.deputyId || "none");
      setIsDeptDialogOpen(true);
      setIsLoadingCandidates(true);
      setHeadCandidates([]);
      try {
        const res = await MembershipQueryService.membershipQueryListCandidatesForDeptResponsible(
          dept.id,
          undefined,
          undefined,
          200,
        );
        if (res && "items" in res && Array.isArray(res.items)) {
          setHeadCandidates(res.items as v1EmployeeCardView[]);
        }
      } catch (e) {
        notify.apiError(e, "Не удалось загрузить список кандидатов");
      } finally {
        setIsLoadingCandidates(false);
      }
    } else {
      setEditingItem(null);
      setNewName("");
      setNewDescription("");
      setNewHeadId("none");
      setNewDeputyId("none");
      setHeadCandidates([]);
      setIsDeptDialogOpen(true);
    }
  };

  const saveDept = async () => {
    // Бэк-валидация: name min=2/max=256, description omitnil min=8/max=2048.
    const name = cleanText(newName) ?? "";
    const description = cleanText(newDescription);
    if (name.length < 2 || !targetClinicId) {
      if (targetClinicId) notify.error("Проверьте поля", "Название обязательно (≥ 2 символов).");
      return;
    }
    if (description !== undefined && description.length < 8) {
      notify.error("Проверьте описание", "Описание должно быть ≥ 8 символов либо пустым.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await OrgStructureCommandService.orgStructureCommandUpdateDepartmentDetails(editingItem.id, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
        await syncResponsible(
          editingItem.id,
          editingItem.oldHeadId,
          newHeadId,
          editingItem.oldDeputyId,
          newDeputyId,
          "department",
        );
      } else {
        const newDeptRes = await OrgStructureCommandService.orgStructureCommandCreateDepartment(targetClinicId, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
        const newDeptId = (newDeptRes as any).id;
        if (newHeadId !== "none" && newDeptId) {
          await MembershipCommandService.membershipCommandAssignDepartmentResponsible(newDeptId, { employeeId: newHeadId });
          if (newDeputyId !== "none") {
            await MembershipCommandService.membershipCommandAssignDepartmentResponsibleDeputy(newDeptId, newHeadId, {
              deputyEmployeeId: newDeputyId,
            }).catch(() => {});
          }
        }
      }
      notify.mutationSuccess("Успешно", "Отделение сохранено.");
      setIsDeptDialogOpen(false);
      loadData();
    } catch (e) {
      notify.apiError(e, "Не удалось сохранить отделение");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDeptStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        const ok = await confirm({
          title: "Деактивировать отделение?",
          description: "Сотрудники не смогут регистрировать заявки/НС в этом отделении.",
          confirmLabel: "Деактивировать",
        });
        if (!ok) return;
        await OrgStructureCommandService.orgStructureCommandDeactivateDepartment(id, {});
        notify.mutationSuccess("Отделение деактивировано", "");
      } else {
        await OrgStructureCommandService.orgStructureCommandActivateDepartment(id, {});
        notify.mutationSuccess("Отделение активировано", "");
      }
      void loadData();
    } catch (e) {
      notify.apiError(e, isActive ? "Не удалось деактивировать отделение" : "Не удалось активировать отделение");
    }
  };

  const deleteDept = async (deptId: string) => {
    const ok = await confirm({
      title: "Удалить отделение безвозвратно?",
      description: "Действие необратимо. Если есть связанные сотрудники/инциденты/заявки — бэк отклонит удаление.",
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (!ok) return;
    try {
      await OrgStructureCommandService.orgStructureCommandDeleteDepartment(deptId);
      notify.mutationSuccess("Отделение удалено", "");
      void loadData();
    } catch (e) {
      notify.apiError(e, "Не удалось удалить отделение");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Структура</h1>
          <p className="text-sm text-muted-foreground">Управление филиалами и отделениями</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          {isLoading && !clinics.length ? (
            <Skeleton className="h-10 flex-1 w-full sm:w-48 lg:w-64 rounded-md" />
          ) : (
            <div className="relative flex-1 w-full sm:w-48 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-9 bg-background w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={!selectedOrgId}
              />
            </div>
          )}

          <Button
            onClick={() => openClinicModal()}
            className="shrink-0 w-full sm:w-auto"
            disabled={isSaving || isLoading || !selectedOrgId}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building className="mr-2 h-4 w-4" />}
            Клиника
          </Button>
        </div>
      </div>

      {!isOrgsLoading && !selectedOrgId && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Сначала выберите активную организацию, чтобы увидеть её структуру.
        </div>
      )}

      {selectedOrgId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {isLoading && clinics.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skel-${i}`} className="flex flex-col overflow-hidden gap-0 p-0 border">
              <CardHeader className="bg-muted/30 border-b px-4 py-3 pb-2!">
                <div className="flex justify-between items-start w-full">
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-32 rounded-sm" />
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-48 rounded-sm" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="p-3"><Skeleton className="h-8 w-full" /></div>
              </CardContent>
            </Card>
          ))}

          {!isLoading && clinics.map((clinic) => {
            const clinicHeadName = getUserName(clinic.headId);
            const clinicDeputyName = getUserName(clinic.deputyId);

            return (
              <Card key={clinic.id} className="flex flex-col overflow-hidden gap-0 p-0 border">
                <CardHeader className="bg-muted/30 border-b px-4 py-3 pb-2!">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm font-bold truncate" title={clinic.name}>
                          {clinic.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background border shrink-0">
                          {clinic.departments?.length || 0} отд.
                        </Badge>
                        {clinic.isActive === false && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-muted-foreground/30 text-muted-foreground shrink-0">
                            Неактивна
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{clinic.physicalAddress || "Адрес не указан"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-primary/80 truncate font-medium">
                          <UserIcon className="h-3 w-3 shrink-0" />
                          {clinicHeadName
                            ? <span className="truncate">Главврач: {clinicHeadName}</span>
                            : <span className="text-muted-foreground italic font-normal">Нет руководителя</span>}
                        </div>
                        {clinicDeputyName && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                            <UserCog className="h-3 w-3 shrink-0" />
                            <span className="truncate">И.о.: {clinicDeputyName}</span>
                          </div>
                        )}
                      </div>
                      {clinic.stats && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 text-[10px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border">
                            <Users className="h-3 w-3" />
                            <b className="text-foreground">{clinic.stats.employeesTotal ?? "0"}</b> сотр.
                          </span>
                          {clinic.stats.employeesOnVacation && Number(clinic.stats.employeesOnVacation) > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border">
                              <Palmtree className="h-3 w-3" />
                              <b className="text-foreground">{clinic.stats.employeesOnVacation}</b> в отпуске
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2 shrink-0 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openClinicModal(clinic)}>
                          <Pencil className="mr-2 h-4 w-4" /> Изменить
                        </DropdownMenuItem>
                        {clinic.isActive === false ? (
                          <DropdownMenuItem onClick={() => toggleClinicStatus(clinic.id, false)}>
                            <Power className="mr-2 h-4 w-4" /> Активировать
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => toggleClinicStatus(clinic.id, true)}>
                            <PowerOff className="mr-2 h-4 w-4" /> Деактивировать
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => deleteClinic(clinic.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Удалить навсегда
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-1">
                  <div className="divide-y divide-border/50">
                    {clinic.departments?.length > 0 ? (
                      clinic.departments.map((dept: any) => {
                        const deptHeadName = getUserName(dept.headId);
                        const deptDeputyName = getUserName(dept.deputyId);
                        return (
                          <div key={dept.id} className="group flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-sm">
                            <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 mr-2">
                              <div className="p-1.5 text-info transition-colors">
                                <Stethoscope className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-foreground font-medium truncate block w-full inline-flex items-center gap-1.5">
                                  {dept.name}
                                  {dept.isActive === false && (
                                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-muted-foreground/30 text-muted-foreground shrink-0">
                                      Неактивно
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground truncate block w-full opacity-80">
                                  {deptHeadName || "Руководитель не назначен"}
                                </span>
                                {deptDeputyName && (
                                  <span className="text-[10px] text-muted-foreground truncate block w-full inline-flex items-center gap-1">
                                    <UserCog className="h-2.5 w-2.5" />
                                    И.о.: {deptDeputyName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openDeptModal(clinic.id, dept)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              {dept.isActive === false ? (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => toggleDeptStatus(dept.id, false)}>
                                  <Power className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => toggleDeptStatus(dept.id, true)}>
                                  <PowerOff className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteDept(dept.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground italic">
                        Нет отделений
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-3 bg-muted/30 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary hover:bg-transparent transition-all"
                    onClick={() => openDeptModal(clinic.id)}
                  >
                    <Building className="mr-2 h-3.5 w-3.5" /> Добавить отделение
                  </Button>
                </div>
              </Card>
            );
          })}

          {!isLoading && clinics.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <Building className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
              <p>В этой организации пока нет клиник</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isClinicDialogOpen} onOpenChange={setIsClinicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Редактировать клинику" : "Новая клиника"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ГКБ №1" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Адрес *</Label>
              <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="ул. Ленина, 1" />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Главный филиал..." />
            </div>
            {/* Главный врач и заместитель назначаются отдельно — после создания клиники, через админку пользователей. */}
            {editingItem?.id && (
              <>
                <div className="grid gap-2">
                  <Label>Главный врач</Label>
                  <SearchableSelect
                    options={buildHeadOptions(headCandidates, users, editingItem.oldHeadId)}
                    value={newHeadId}
                    onChange={(v) => {
                      setNewHeadId(v);
                      if (v === "none") setNewDeputyId("none");
                    }}
                    placeholder={isLoadingCandidates ? "Загрузка кандидатов..." : "Выберите руководителя"}
                    disabled={isLoadingCandidates}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1.5">
                    <UserCog className="h-3.5 w-3.5" />
                    Заместитель
                  </Label>
                  <SearchableSelect
                    options={buildHeadOptions(headCandidates, users, editingItem.oldDeputyId, newHeadId)}
                    value={newDeputyId}
                    onChange={setNewDeputyId}
                    placeholder={newHeadId === "none" ? "Сначала назначьте главврача" : "Выберите заместителя"}
                    disabled={newHeadId === "none" || isLoadingCandidates}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Замещает главврача на время отпуска или болезни.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClinicDialogOpen(false)}>Отмена</Button>
            <Button onClick={saveClinic} disabled={!newName.trim() || !newAddress.trim() || isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Редактировать отделение" : "Новое отделение"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название отделения *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Хирургия" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Дополнительная информация..." />
            </div>
            {editingItem?.id && (
              <>
                <div className="grid gap-2">
                  <Label>Заведующий отделением</Label>
                  <SearchableSelect
                    options={buildHeadOptions(headCandidates, users, editingItem.oldHeadId)}
                    value={newHeadId}
                    onChange={(v) => {
                      setNewHeadId(v);
                      if (v === "none") setNewDeputyId("none");
                    }}
                    placeholder={isLoadingCandidates ? "Загрузка кандидатов..." : "Выберите заведующего"}
                    disabled={isLoadingCandidates}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1.5">
                    <UserCog className="h-3.5 w-3.5" />
                    Заместитель
                  </Label>
                  <SearchableSelect
                    options={buildHeadOptions(headCandidates, users, editingItem.oldDeputyId, newHeadId)}
                    value={newDeputyId}
                    onChange={setNewDeputyId}
                    placeholder={newHeadId === "none" ? "Сначала назначьте заведующего" : "Выберите заместителя"}
                    disabled={newHeadId === "none" || isLoadingCandidates}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Замещает заведующего на время отпуска или болезни.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>Отмена</Button>
            <Button onClick={saveDept} disabled={!newName.trim() || isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
