"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Search, 
  ShieldAlert, 
  CheckCircle2,
  Building,
  User as UserIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card"; // Добавили Card
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

import { INITIAL_USERS, INITIAL_CLINICS, User } from "@/lib/admin-mock";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.login.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    const updatedUser = {
        ...editingUser,
        status: (editingUser.role !== 'Гость' && editingUser.clinicId) ? "active" : "pending"
    };
    setUsers(users.map(u => u.id === editingUser.id ? updatedUser as User : u));
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if(confirm("Удалить пользователя из системы?")) setUsers(users.filter(u => u.id !== id));
  };

  const availableDepts = INITIAL_CLINICS.find(c => c.id === editingUser?.clinicId)?.departments || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Шапка */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
            <p className="text-sm text-muted-foreground">Управление доступом и ролями сотрудников</p>
        </div>
      </div>

      {/* Поиск */}
      <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск по ФИО или логину..." 
            className="pl-9 bg-background" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      {/* === ВАРИАНТ 1: ТАБЛИЦА (Для ПК) === */}
      <div className="hidden md:block bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Пользователь / Логин</TableHead>
                    <TableHead className="text-muted-foreground">Статус</TableHead>
                    <TableHead className="text-muted-foreground">Роль</TableHead>
                    <TableHead className="text-muted-foreground">Место работы</TableHead>
                    <TableHead className="text-right text-muted-foreground">Действия</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map(user => {
                    const clinicName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.name || "—";
                    const deptName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.departments.find(d => d.id === user.departmentId)?.name || "—";
                    const isNew = user.status === 'pending';

                    return (
                        <TableRow key={user.id} className={`border-b border-border ${isNew ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                            <TableCell>
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">@{user.login}</div>
                            </TableCell>
                            <TableCell>
                                {isNew ? (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                                        <ShieldAlert className="w-3 h-3 mr-1" /> Требует настройки
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Активен
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className={`font-medium ${user.role === 'Гость' ? 'text-muted-foreground italic' : 'text-foreground'}`}>{user.role}</span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                <div className="font-medium text-xs text-foreground">{clinicName}</div>
                                <div className="text-[10px] text-muted-foreground">{deptName}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button variant={isNew ? "default" : "ghost"} size="sm" className={isNew ? "h-8" : "h-8 w-8 p-0 text-muted-foreground"} onClick={() => handleEditUser(user)}>
                                        {isNew ? "Настроить" : <Pencil className="h-4 w-4" />}
                                    </Button>
                                    {!isNew && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
      </div>

      {/* === ВАРИАНТ 2: КАРТОЧКИ (Для Мобильных) === */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map(user => {
            const clinicName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.name || "Не назначено";
            const deptName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.departments.find(d => d.id === user.departmentId)?.name || "";
            const isNew = user.status === 'pending';

            return (
                <Card key={user.id} className={`overflow-hidden p-0 ${isNew ? 'border-warning/30 bg-warning/5' : 'bg-card border-border'}`}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-semibold text-foreground">{user.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">@{user.login}</div>
                            </div>
                            {isNew ? (
                                <Badge 
                                    variant="secondary" className="bg-warning/15 text-warning hover:bg-warning/25 border-warning/20 border whitespace-nowrap text-[10px]">
                                    <ShieldAlert className="w-3 h-3 mr-1" />
                                    Требует настройки
                                </Badge>
                            ) : (
                                <Badge 
                                    variant="outline" className="bg-success/10 text-success border-success/20 whitespace-nowrap text-[10px]"
                                >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Активен
                                </Badge>
                            )}
                        </div>

                        {/* Информация: Роль и Место */}
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UserIcon className="h-3.5 w-3.5" />
                                <span className="font-medium text-foreground">{user.role}</span>
                            </div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <Building className="h-3.5 w-3.5 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-xs">{clinicName}</span>
                                    {deptName && <span className="text-[10px] text-muted-foreground">{deptName}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                            <Button 
                                variant={isNew ? "default" : "outline"} 
                                size="sm" 
                                className="flex-1 h-9"
                                onClick={() => handleEditUser(user)}
                            >
                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                {isNew ? "Настроить права" : "Редактировать"}
                            </Button>
                            {!isNew && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 px-3 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            );
        })}
      </div>

      {/* Диалог (Оставляем без изменений) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Настройка доступа</DialogTitle>
                <DialogDescription>
                    Назначьте роль и место работы для <b>@{editingUser?.login}</b>
                </DialogDescription>
            </DialogHeader>
            
            {editingUser && (
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>ФИО сотрудника</Label>
                        <Input value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Роль в системе</Label>
                        <Select value={editingUser.role} onValueChange={(v: any) => setEditingUser({...editingUser, role: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Гость" disabled>Гость (Без доступа)</SelectItem>
                                <SelectItem value="Регистратор">Регистратор</SelectItem>
                                <SelectItem value="Ответственный">Ответственный</SelectItem>
                                <SelectItem value="Администратор">Администратор</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Клиника</Label>
                        <Select value={editingUser.clinicId || ""} onValueChange={(v) => setEditingUser({...editingUser, clinicId: v, departmentId: null})}>
                            <SelectTrigger><SelectValue placeholder="Выберите клинику" /></SelectTrigger>
                            <SelectContent>
                                {INITIAL_CLINICS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Отделение</Label>
                        <Select value={editingUser.departmentId || ""} onValueChange={(v) => setEditingUser({...editingUser, departmentId: v})} disabled={!editingUser.clinicId}>
                            <SelectTrigger><SelectValue placeholder="Выберите отделение" /></SelectTrigger>
                            <SelectContent>
                                {availableDepts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <DialogFooter>
                <Button onClick={handleSaveUser}>Сохранить изменения</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}