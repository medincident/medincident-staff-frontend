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
  Loader2,
  Power,
  PowerOff
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
import { notify } from "@/lib/toast";
import {
  MembershipQueryServiceService,
  MembershipCommandServiceService,
  OrgStructureQueryServiceService,
  OrgStructureCommandServiceService,
} from "@/lib/api-generated";
import type { v1EmployeeCardView } from "@/lib/api-generated";

export function StructureView() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [isOrgsLoading, setIsOrgsLoading] = useState(true);

  const [clinics, setClinics] = useState<any[]>([]);
  const [users, setUsers] = useState<v1EmployeeCardView[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [isClinicDialogOpen, setIsClinicDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<{ id?: string, parentId?: string, oldHeadId?: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHeadId, setNewHeadId] = useState<string>("none");
  const [targetClinicId, setTargetClinicId] = useState<string | null>(null);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const res = await OrgStructureQueryServiceService.orgStructureQueryServiceListOrganizations(100);
        const items = (res as any).items || [];
        setOrganizations(items);
        if (items.length > 0) {
          setSelectedOrgId(items[0].id);
        }
      } catch (error) {
        notify.error("Ошибка", "Не удалось загрузить список организаций.");
      } finally {
        setIsOrgsLoading(false);
      }
    };
    loadOrgs();
  }, []);

  const loadData = async () => {
    if (!selectedOrgId) return;

    try {
      setIsLoading(true);

      // Загружаем сотрудников организации (для выбора руководителей)
      const usersRes = await MembershipQueryServiceService.membershipQueryServiceListEmployeesByOrganization(selectedOrgId, 100);
      setUsers((usersRes as any).items || []);

      // Загружаем клиники
      const clinicsRes = await OrgStructureQueryServiceService.orgStructureQueryServiceListClinicsByOrganization(selectedOrgId, 100);
      const clinicsItems = (clinicsRes as any).items || [];

      // Фильтрация по поиску (клиентская)
      const filteredClinics = search
        ? clinicsItems.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
        : clinicsItems;

      const builtClinics = await Promise.all(filteredClinics.map(async (clinic: any) => {
        const deptsRes = await OrgStructureQueryServiceService.orgStructureQueryServiceListDepartmentsByClinic(clinic.id, 100);
        const deptsItems = (deptsRes as any).items || [];

        let clinicHeadId: string | undefined;
        try {
          const cHeadRes = await MembershipQueryServiceService.membershipQueryServiceGetClinicHead(clinic.id);
          clinicHeadId = (cHeadRes as any).employee?.employeeId;
        } catch { /* нет руководителя */ }

        const builtDepts = await Promise.all(deptsItems.map(async (dept: any) => {
          let deptHeadId: string | undefined;
          try {
            const dHeadRes = await MembershipQueryServiceService.membershipQueryServiceGetDepartmentResponsible(dept.id);
            deptHeadId = (dHeadRes as any).employee?.employeeId;
          } catch { /* нет заведующего */ }
          return { ...dept, headId: deptHeadId };
        }));

        return { ...clinic, headId: clinicHeadId, departments: builtDepts };
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
    type: "clinic" | "department"
  ) => {
    const finalNewId = newHeadId === "none" ? undefined : newHeadId;
    if (oldHeadId === finalNewId) return;

    if (type === "clinic") {
      if (oldHeadId) await MembershipCommandServiceService.membershipCommandServiceRevokeClinicHead(targetId, oldHeadId).catch(() => {});
      if (finalNewId) await MembershipCommandServiceService.membershipCommandServiceAssignClinicHead(targetId, { employeeId: finalNewId }).catch(() => {});
    } else {
      if (oldHeadId) await MembershipCommandServiceService.membershipCommandServiceRevokeDepartmentResponsible(targetId, oldHeadId).catch(() => {});
      if (finalNewId) await MembershipCommandServiceService.membershipCommandServiceAssignDepartmentResponsible(targetId, { employeeId: finalNewId }).catch(() => {});
    }
  };

  const openClinicModal = (clinic?: any) => {
    if (clinic) {
      setEditingItem({ id: clinic.id, oldHeadId: clinic.headId });
      setNewName(clinic.name);
      setNewDescription(clinic.description || "");
      setNewAddress(clinic.physicalAddress || "");
      setNewHeadId(clinic.headId || "none");
    } else {
      setEditingItem(null);
      setNewName("");
      setNewDescription("");
      setNewAddress("");
      setNewHeadId("none");
    }
    setIsClinicDialogOpen(true);
  };

  const saveClinic = async () => {
    if (!newName.trim() || !newAddress.trim() || !selectedOrgId) return;
    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await OrgStructureCommandServiceService.orgStructureCommandServiceUpdateClinicDetails(editingItem.id, {
          name: newName,
          description: newDescription || ""
        });
        await OrgStructureCommandServiceService.orgStructureCommandServiceUpdateClinicPhysicalAddress(editingItem.id, {
          physicalAddress: { text: newAddress }
        });
        await syncResponsible(editingItem.id, editingItem.oldHeadId, newHeadId, "clinic");
      } else {
        const newClinicRes = await OrgStructureCommandServiceService.orgStructureCommandServiceCreateClinic(selectedOrgId, {
          name: newName,
          description: newDescription || "",
          physicalAddress: { text: newAddress }
        });
        const newClinicId = (newClinicRes as any).id;
        if (newHeadId !== "none" && newClinicId) {
          await MembershipCommandServiceService.membershipCommandServiceAssignClinicHead(newClinicId, { employeeId: newHeadId });
        }
      }
      notify.mutationSuccess("Успешно", "Клиника сохранена.");
      setIsClinicDialogOpen(false);
      loadData();
    } catch (e) {
      notify.mutationError("Ошибка", "Не удалось сохранить клинику.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleClinicStatus = async (_id: string, _isActive: boolean) => {
    notify.error("Не поддерживается", "В новом API удаление/деактивация клиник пока недоступны.");
  };

  const deleteClinic = async (_id: string) => {
    notify.error("Не поддерживается", "В новом API удаление клиник пока недоступно.");
  };

  const openDeptModal = (clinicId: string, dept?: any) => {
    setTargetClinicId(clinicId);
    if (dept) {
      setEditingItem({ id: dept.id, parentId: clinicId, oldHeadId: dept.headId });
      setNewName(dept.name);
      setNewDescription(dept.description || "");
      setNewHeadId(dept.headId || "none");
    } else {
      setEditingItem(null);
      setNewName("");
      setNewDescription("");
      setNewHeadId("none");
    }
    setIsDeptDialogOpen(true);
  };

  const saveDept = async () => {
    if (!newName.trim() || !targetClinicId) return;
    setIsSaving(true);
    try {
      if (editingItem?.id) {
        await OrgStructureCommandServiceService.orgStructureCommandServiceUpdateDepartmentDetails(editingItem.id, {
          name: newName,
          description: newDescription || ""
        });
        await syncResponsible(editingItem.id, editingItem.oldHeadId, newHeadId, "department");
      } else {
        const newDeptRes = await OrgStructureCommandServiceService.orgStructureCommandServiceCreateDepartment(targetClinicId, {
          name: newName,
          description: newDescription || ""
        });
        const newDeptId = (newDeptRes as any).id;
        if (newHeadId !== "none" && newDeptId) {
          await MembershipCommandServiceService.membershipCommandServiceAssignDepartmentResponsible(newDeptId, { employeeId: newHeadId });
        }
      }
      notify.mutationSuccess("Успешно", "Отделение сохранено.");
      setIsDeptDialogOpen(false);
      loadData();
    } catch (e) {
      notify.mutationError("Ошибка", "Не удалось сохранить отделение.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDeptStatus = async (_id: string, _isActive: boolean) => {
    notify.error("Не поддерживается", "В новом API деактивация отделений пока недоступна.");
  };

  const deleteDept = async (_deptId: string) => {
    notify.error("Не поддерживается", "В новом API удаление отделений пока недоступно.");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Структура</h1>
          <p className="text-sm text-muted-foreground">Управление филиалами и отделениями</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          {isOrgsLoading ? (
            <Skeleton className="h-10 w-full sm:w-48 rounded-md shrink-0" />
          ) : (
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger className="w-full sm:w-48 bg-background shrink-0">
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {organizations.length === 0 && (
                  <SelectItem value="none" disabled>Нет организаций</SelectItem>
                )}
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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

      {!isOrgsLoading && organizations.length === 0 && (
        <div className="py-16 text-center border rounded-xl bg-card">
          <Building className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Нет организаций</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Сначала создайте медицинскую сеть (организацию).</p>
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

            return (
              <Card key={clinic.id} className="flex flex-col overflow-hidden gap-0 p-0 border">
                <CardHeader className="bg-muted/30 border-b px-4 py-3 pb-2!">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold truncate" title={clinic.name}>
                          {clinic.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background border shrink-0">
                          {clinic.departments?.length || 0} отд.
                        </Badge>
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
                      </div>
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
                        <DropdownMenuItem onClick={() => toggleClinicStatus(clinic.id, true)}>
                          <PowerOff className="mr-2 h-4 w-4" /> Деактивировать
                        </DropdownMenuItem>
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
                        return (
                          <div key={dept.id} className="group flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-sm">
                            <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 mr-2">
                              <div className="p-1.5 text-info transition-colors">
                                <Stethoscope className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-foreground font-medium truncate block w-full">
                                  {dept.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate block w-full opacity-80">
                                  {deptHeadName || "Руководитель не назначен"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openDeptModal(clinic.id, dept)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => toggleDeptStatus(dept.id, true)}>
                                <PowerOff className="h-3.5 w-3.5" />
                              </Button>
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
            <div className="grid gap-2">
              <Label>Главный врач</Label>
              <Select value={newHeadId} onValueChange={setNewHeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите руководителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.employeeId} value={u.employeeId as string}>
                      {u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <div className="grid gap-2">
              <Label>Заведующий отделением</Label>
              <Select value={newHeadId} onValueChange={setNewHeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите заведующего" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.employeeId} value={u.employeeId as string}>
                      {u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
