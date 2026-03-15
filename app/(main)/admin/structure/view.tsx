"use client";

import { useState, useMemo, useEffect } from "react";
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
  Loader2
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
  DialogDescription,
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
import { toast } from "sonner";

import { User, Clinic, Department } from "@/lib/types";
import { ROLE_NAMES } from "@/lib/constants";

// Импортируем сервисы
import { getStructure, saveStructure } from "@/lib/services/admin/structure";
import { getUsers } from "@/lib/services/users";

export function StructureView() {
  // --- STATE ---
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog State
  const [isClinicDialogOpen, setIsClinicDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  
  // Form State
  const [editingItem, setEditingItem] = useState<{ id?: string, parentId?: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHeadId, setNewHeadId] = useState<string>("none");
  const [targetClinicId, setTargetClinicId] = useState<string | null>(null);

  // 1. ЗАГРУЗКА ДАННЫХ (Client-side)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Грузим клиники и пользователей параллельно
        const [clinicsData, usersData] = await Promise.all([
          getStructure(),
          getUsers()
        ]);
        
        setClinics(clinicsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load structure:", error);
        toast.error("Ошибка", { description: "Не удалось загрузить данные" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- HELPERS ---
  const getUserName = (userId?: string) => {
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    return user ? user.name : null;
  };

  const availableHeads = useMemo(() => {
    return users.filter((u) => u.role !== "guest");
  }, [users]);

  // --- ACTIONS ---
  const syncStructureWithServer = async (newData: Clinic[]) => {
    // Оптимистичное обновление
    const prevData = clinics;
    setClinics(newData);
    setIsSaving(true);

    try {
      await saveStructure(newData);
      toast.success("Успешно", { description: "Структура обновлена" });
    } catch (e) {
      console.error(e);
      toast.error("Ошибка", { description: "Не удалось сохранить изменения" });
      setClinics(prevData); // Откат
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return clinics;
    const lowerSearch = search.toLowerCase();

    return clinics.map(clinic => {
      const clinicMatch = clinic.name.toLowerCase().includes(lowerSearch) ||
        clinic.address.toLowerCase().includes(lowerSearch);
      const matchingDepts = clinic.departments.filter(d => d.name.toLowerCase().includes(lowerSearch));

      if (clinicMatch) return clinic;
      if (matchingDepts.length > 0) {
        return { ...clinic, departments: matchingDepts };
      }
      return null;
    }).filter(Boolean) as Clinic[];
  }, [clinics, search]);

  // --- MODAL HANDLERS ---
  const openClinicModal = (clinic?: Clinic) => {
    if (clinic) {
      setEditingItem({ id: clinic.id });
      setNewName(clinic.name);
      setNewAddress(clinic.address);
      setNewHeadId(clinic.headId || "none");
    } else {
      setEditingItem(null);
      setNewName("");
      setNewAddress("");
      setNewHeadId("none");
    }
    setIsClinicDialogOpen(true);
  };

  const saveClinic = () => {
    if (!newName.trim()) return;
    const finalHeadId = newHeadId === "none" ? undefined : newHeadId;
    let newData;
    if (editingItem?.id) {
      newData = clinics.map(c => c.id === editingItem.id ? {
        ...c,
        name: newName,
        address: newAddress,
        headId: finalHeadId
      } : c);
    } else {
      newData = [...clinics, {
        id: `cl_${Date.now()}`,
        name: newName,
        address: newAddress,
        departments: [],
        headId: finalHeadId
      }];
    }
    syncStructureWithServer(newData);
    setIsClinicDialogOpen(false);
  };

  const deleteClinic = (id: string) => {
    if (confirm("Вы уверены? Это удалит клинику и ВСЕ данные о ней!")) {
      const newData = clinics.filter(c => c.id !== id);
      syncStructureWithServer(newData);
    }
  };

  const openDeptModal = (clinicId: string, dept?: Department) => {
    setTargetClinicId(clinicId);
    if (dept) {
      setEditingItem({ id: dept.id, parentId: clinicId });
      setNewName(dept.name);
      setNewHeadId(dept.headId || "none");
    } else {
      setEditingItem(null);
      setNewName("");
      setNewHeadId("none");
    }
    setIsDeptDialogOpen(true);
  };

  const saveDept = () => {
    if (!newName.trim() || !targetClinicId) return;
    const finalHeadId = newHeadId === "none" ? undefined : newHeadId;
    let newData;
    if (editingItem?.id) {
      newData = clinics.map(c => {
        if (c.id === targetClinicId) {
          return {
            ...c,
            departments: c.departments.map(d => d.id === editingItem.id ? {
              ...d,
              name: newName,
              headId: finalHeadId
            } : d)
          };
        }
        return c;
      });
    } else {
      newData = clinics.map(c => {
        if (c.id === targetClinicId) {
          return {
            ...c,
            departments: [...c.departments, {
              id: `dep_${Date.now()}`,
              name: newName,
              headId: finalHeadId
            }]
          };
        }
        return c;
      });
    }
    syncStructureWithServer(newData);
    setIsDeptDialogOpen(false);
  };

  const deleteDept = (deptId: string, clinicId: string) => {
    if (confirm("Удалить отделение?")) {
      const newData = clinics.map(c => {
        if (c.id === clinicId) {
          return { ...c, departments: c.departments.filter(d => d.id !== deptId) };
        }
        return c;
      });
      syncStructureWithServer(newData);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Структура</h1>
          <p className="text-sm text-muted-foreground">Клиники, филиалы и отделения</p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {isLoading ? (
            /* SEARCH SKELETON */
            <Skeleton className="h-9 flex-1 lg:w-64 rounded-md" />
          ) : (
            /* SEARCH INPUT */
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Название или адрес..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          
          <Button onClick={() => openClinicModal()} className="shrink-0" disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building className="mr-2 h-4 w-4" />}
            Клиника
          </Button>
        </div>
      </div>

      {/* LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        
        {/* SKELETON STATE */}
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={`skel-${i}`} className="flex flex-col overflow-hidden gap-0 p-0 border">
            <CardHeader className="bg-muted/30 border-b px-4 py-3 pb-2!">
              <div className="flex justify-between items-start w-full">
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32 rounded-sm" />
                    <Skeleton className="h-5 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-48 rounded-sm" />
                  <Skeleton className="h-3 w-40 rounded-sm" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md shrink-0 ml-2" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-border/50">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-3 bg-muted/30 border-t">
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </Card>
        ))}

        {/* REAL DATA */}
        {!isLoading && filteredData.map((clinic) => {
          const clinicHeadName = getUserName(clinic.headId);

          return (
            <Card key={clinic.id} className="flex flex-col overflow-hidden gap-0 p-0 border">
              <CardHeader className="bg-muted/30 border-b px-4 py-3 pb-2!">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold truncate" title={clinic.name}>
                        {clinic.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background border ">
                        {clinic.departments.length}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {clinic.address}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-primary/80 truncate font-medium">
                        <UserIcon className="h-3 w-3 shrink-0" />
                        {clinicHeadName
                          ? `Главврач: ${clinicHeadName}`
                          : <span className="text-muted-foreground italic font-normal">Нет руководителя</span>}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openClinicModal(clinic)}>
                        <Pencil className="mr-2 h-4 w-4" /> Изменить
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => deleteClinic(clinic.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border/50">
                  {clinic.departments.length > 0 ? (
                    clinic.departments.map((dept) => {
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
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => openDeptModal(clinic.id, dept)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteDept(dept.id, clinic.id)}
                            >
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

        {!isLoading && filteredData.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Building className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>

      {/* DIALOGS */}
      <Dialog open={isClinicDialogOpen} onOpenChange={setIsClinicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Редактировать клинику' : 'Новая клиника'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ГКБ №1" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Адрес</Label>
              <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="ул. Ленина, 1" />
            </div>
            <div className="grid gap-2">
              <Label>Главный врач</Label>
              <Select value={newHeadId} onValueChange={setNewHeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите руководителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {availableHeads.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} <span className="text-muted-foreground text-xs">({ROLE_NAMES?.[u.role] || u.role})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClinicDialogOpen(false)}>Отмена</Button>
            <Button onClick={saveClinic} disabled={!newName.trim()}>
              <Save className="mr-2 h-4 w-4" /> Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Редактировать отделение' : 'Новое отделение'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название отделения</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Хирургия" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Заведующий отделением</Label>
              <Select value={newHeadId} onValueChange={setNewHeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите заведующего" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {availableHeads.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} <span className="text-muted-foreground text-xs">({ROLE_NAMES?.[u.role] || u.role})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>Отмена</Button>
            <Button onClick={saveDept} disabled={!newName.trim()}>
              <Save className="mr-2 h-4 w-4" /> Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}