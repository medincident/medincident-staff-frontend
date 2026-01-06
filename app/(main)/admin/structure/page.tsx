"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Building, 
  MapPin, 
  Search,
  Stethoscope,
  MoreVertical,
  Save
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Импорт типов и мок-данных
import { INITIAL_CLINICS, Clinic, Department } from "@/lib/admin-mock";

export default function StructurePage() {
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS);
  const [search, setSearch] = useState("");
  
  // Состояния диалогов
  const [isClinicDialogOpen, setIsClinicDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  
  // Состояние редактирования
  // Для Клиники храним: id, name, address
  // Для Отделения храним: id, name, parentId (id клиники)
  const [editingItem, setEditingItem] = useState<{ id?: string, name: string, address?: string, parentId?: string } | null>(null);
  
  // Временные поля для инпутов
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [targetClinicId, setTargetClinicId] = useState<string | null>(null);

  // --- УМНЫЙ ПОИСК ---
  const filteredData = useMemo(() => {
    if (!search) return clinics;
    const lowerSearch = search.toLowerCase();

    return clinics.map(clinic => {
      // Ищем совпадение в названии клиники ИЛИ в адресе
      const clinicMatch = clinic.name.toLowerCase().includes(lowerSearch) || 
                          clinic.address.toLowerCase().includes(lowerSearch);

      // Ищем совпадение внутри отделений
      const matchingDepts = clinic.departments.filter(d => d.name.toLowerCase().includes(lowerSearch));
      
      // Если совпала клиника - показываем её и все отделения
      if (clinicMatch) return clinic;

      // Если совпали только отделения - показываем клинику только с ними
      if (matchingDepts.length > 0) {
        return { ...clinic, departments: matchingDepts };
      }
      return null;
    }).filter(Boolean) as Clinic[];
  }, [clinics, search]);

  // --- ЛОГИКА КЛИНИК (Parent) ---

  const openClinicModal = (clinic?: Clinic) => {
    if (clinic) {
        setEditingItem({ id: clinic.id, name: clinic.name, address: clinic.address });
        setNewName(clinic.name);
        setNewAddress(clinic.address);
    } else {
        setEditingItem(null);
        setNewName("");
        setNewAddress("");
    }
    setIsClinicDialogOpen(true);
  };

  const saveClinic = () => {
    if (!newName.trim()) return;
    
    if (editingItem?.id) {
      // Редактирование
      setClinics(clinics.map(c => c.id === editingItem.id ? { ...c, name: newName, address: newAddress } : c));
    } else {
      // Создание
      setClinics([...clinics, { 
        id: `cl_${Date.now()}`, 
        name: newName, 
        address: newAddress, 
        departments: [] 
      }]);
    }
    setIsClinicDialogOpen(false);
  };

  const deleteClinic = (id: string) => {
    if(confirm("Вы уверены? Это удалит клинику и ВСЕХ сотрудников, привязанных к ней!")) {
        setClinics(clinics.filter(c => c.id !== id));
    }
  };

  // --- ЛОГИКА ОТДЕЛЕНИЙ (Child) ---

  const openDeptModal = (clinicId: string, dept?: Department) => {
    setTargetClinicId(clinicId);
    if (dept) {
        setEditingItem({ id: dept.id, name: dept.name, parentId: clinicId });
        setNewName(dept.name);
    } else {
        setEditingItem(null);
        setNewName("");
    }
    setIsDeptDialogOpen(true);
  };

  const saveDept = () => {
    if (!newName.trim() || !targetClinicId) return;
    
    if (editingItem?.id) {
        // Редактирование
        setClinics(clinics.map(c => {
            if (c.id === targetClinicId) {
                return {
                    ...c,
                    departments: c.departments.map(d => d.id === editingItem.id ? { ...d, name: newName } : d)
                };
            }
            return c;
        }));
    } else {
        // Создание
        setClinics(clinics.map(c => {
            if (c.id === targetClinicId) {
                return {
                    ...c,
                    departments: [...c.departments, { id: `dep_${Date.now()}`, name: newName }]
                };
            }
            return c;
        }));
    }
    setIsDeptDialogOpen(false);
  };

  const deleteDept = (deptId: string, clinicId: string) => {
      if(confirm("Удалить отделение?")) {
        setClinics(clinics.map(c => {
            if (c.id === clinicId) {
                return { ...c, departments: c.departments.filter(d => d.id !== deptId) };
            }
            return c;
        }));
      }
  };

  return (
    <div className="space-y-6">
      
      {/* --- ШАПКА + ПОИСК --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-foreground">Структура</h1>
                <p className="text-sm text-muted-foreground">Клиники, филиалы и отделения</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Название или адрес..." 
                    className="pl-9 bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Button onClick={() => openClinicModal()} className="shrink-0">
                <Building className="mr-2 h-4 w-4" />
                Клиника
            </Button>
        </div>
      </div>

      {/* --- СЕТКА КАРТОЧЕК (КЛИНИКИ) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {filteredData.map((clinic) => (
            <Card key={clinic.id} className="flex flex-col overflow-hidden gap-0 p-0">
                
                {/* Заголовок карточки */}
                <CardHeader className="bg-muted/50 border-b px-4 py-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-bold truncate" title={clinic.name}>
                                    {clinic.name}
                                </CardTitle>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background border border-border">
                                    {clinic.departments.length}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {clinic.address}
                            </div>
                        </div>

                        {/* Меню действий */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
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

                {/* Список отделений */}
                <CardContent className="p-0 flex-1">
                    <div className="divide-y">
                        {clinic.departments.length > 0 ? (
                            clinic.departments.map((dept) => (
                                <div key={dept.id} className="group flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-sm">
                                    
                                    {/* Левая часть: Иконка + Текст */}
                                    <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1 mr-2">
                                        <div className="p-1.5 bg-muted rounded text-primary shrink-0">
                                            <Stethoscope className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-foreground truncate block w-full">
                                            {dept.name}
                                        </span>
                                    </div>
                                    
                                    {/* Правая часть: Кнопки */}
                                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() => openDeptModal(clinic.id, dept)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteDept(dept.id, clinic.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-xs text-muted-foreground italic">
                                Нет отделений
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* Кнопка "Добавить отделение" */}
                <div className="p-3 bg-muted/30 border-t">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary hover:bg-transparent"
                        onClick={() => openDeptModal(clinic.id)}
                    >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Добавить отделение
                    </Button>
                </div>
            </Card>
        ))}

        {/* Заглушка поиска */}
        {filteredData.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <p>Ничего не найдено</p>
            </div>
        )}
      </div>

      {/* === ДИАЛОГ: КЛИНИКА === */}
      <Dialog open={isClinicDialogOpen} onOpenChange={setIsClinicDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem?.id ? 'Редактировать клинику' : 'Новая клиника'}</DialogTitle>
                <DialogDescription>Филиал медицинской организации.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Название</Label>
                    <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="ГКБ №1"
                        autoFocus 
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Адрес</Label>
                    <Input 
                        value={newAddress} 
                        onChange={(e) => setNewAddress(e.target.value)} 
                        placeholder="ул. Ленина, 1" 
                    />
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

      {/* === ДИАЛОГ: ОТДЕЛЕНИЕ === */}
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem?.id ? 'Редактировать отделение' : 'Новое отделение'}</DialogTitle>
                <DialogDescription>Структурное подразделение клиники.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Название отделения</Label>
                    <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="Хирургия" 
                        autoFocus
                    />
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