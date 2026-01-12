"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Pencil, 
  Trash2, 
  Search, 
  ShieldAlert, 
  CheckCircle2,
  Building,
  Mail,
  Briefcase,
  Ban
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

import { MOCK_USERS, INITIAL_CLINICS, User, UserRole, UserStatus } from "@/lib/admin-mock";

const ROLE_LABELS: Record<UserRole, string> = {
  admin_system: "Системный администратор",
  admin_org: "Администратор организации",
  head_clinic: "Главный врач / Директор",
  head_dept: "Заведующий отделением",
  dispatcher_ns: "Диспетчер (Безопасность)",
  dispatcher_req: "Диспетчер (АХО)",
  worker: "Сотрудник / Врач",
  guest: "Гость (Ожидает регистрации)"
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.login.toLowerCase().includes(search.toLowerCase()) ||
    u.position.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    // Логика авто-активации: Если роль сменили с Guest на что-то другое, ставим Active
    let updatedStatus = editingUser.status;
    if (editingUser.role !== 'guest' && editingUser.status === 'pending') {
        updatedStatus = 'active';
    }

    const updatedUser = {
        ...editingUser,
        status: updatedStatus
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
      <div className="flex items-center gap-2">
        <div>
            <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
            <p className="text-sm text-muted-foreground">Управление доступом и ролями сотрудников</p>
        </div>
      </div>

      <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск по ФИО, логину или должности..." 
            className="pl-9 bg-background" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
      </div>

      {/* === ВАРИАНТ 1: ТАБЛИЦА (ПК) === */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
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
                {filteredUsers.map(user => {
                    const clinicName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.name || "—";
                    const deptName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.departments.find(d => d.id === user.departmentId)?.name;
                    const isNew = user.status === 'pending';

                    return (
                        // Используем bg-warning/5 для подсветки строки, чтобы не было "кислотно"
                        <TableRow key={user.id} className={`border-b ${isNew ? "bg-warning/5 hover:bg-warning/10" : ""}`}>
                            <TableCell>
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mt-0.5">
                                    <span className="font-mono">@{user.login}</span>
                                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.status === 'pending' && (
                                    <Badge variant="outline" className="bg-warning/15 text-warning border-warning/20">
                                        <ShieldAlert className="w-3 h-3 mr-1" /> Ожидает
                                    </Badge>
                                )}
                                {user.status === 'active' && (
                                    <Badge variant="outline" className="bg-success/15 text-success border-success/20">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Активен
                                    </Badge>
                                )}
                                {user.status === 'blocked' && (
                                    <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/20">
                                        <Ban className="w-3 h-3 mr-1" /> Заблокирован
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className={`font-medium text-sm ${user.role === 'guest' ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                                        {ROLE_LABELS[user.role]}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{user.position}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {user.role.includes('admin') ? (
                                    <span className="text-xs italic text-muted-foreground">Центральный офис</span>
                                ) : (
                                    <>
                                        <div className="font-medium text-xs text-foreground">{clinicName}</div>
                                        {deptName && <div className="text-[10px] text-muted-foreground">{deptName}</div>}
                                    </>
                                )}
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

      {/* === ВАРИАНТ 2: КАРТОЧКИ (Мобильные) === */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map(user => {
            const clinicName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.name || "Не назначено";
            const deptName = INITIAL_CLINICS.find(c => c.id === user.clinicId)?.departments.find(d => d.id === user.departmentId)?.name;
            const isNew = user.status === 'pending';

            return (
                <Card key={user.id} className={`overflow-hidden p-0 border ${isNew ? 'border-warning/30 bg-warning/5' : 'bg-card'}`}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-semibold text-foreground text-sm">{user.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">@{user.login}</div>
                            </div>
                            
                            {user.status === 'pending' && (
                                <Badge variant="outline" className="bg-warning/15 text-warning border-warning/20 whitespace-nowrap text-[10px]">
                                    <ShieldAlert className="w-3 h-3 mr-1" /> Новый
                                </Badge>
                            )}
                            {user.status === 'active' && (
                                <Badge variant="outline" className="bg-success/15 text-success border-success/20 whitespace-nowrap text-[10px]">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Активен
                                </Badge>
                            )}
                             {user.status === 'blocked' && (
                                <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/20 whitespace-nowrap text-[10px]">
                                    <Ban className="w-3 h-3 mr-1" /> Блок
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-3.5 w-3.5" />
                                <div className="flex flex-col leading-tight">
                                    <span className="font-medium text-foreground text-xs">{ROLE_LABELS[user.role]}</span>
                                    <span className="text-[10px]">{user.position}</span>
                                </div>
                            </div>
                            {!user.role.includes('admin') && (
                                <div className="flex items-start gap-2 text-muted-foreground">
                                    <Building className="h-3.5 w-3.5 mt-0.5" />
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-xs">{clinicName}</span>
                                        {deptName && <span className="text-[10px] text-muted-foreground">{deptName}</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border/50">
                            <Button 
                                variant={isNew ? "default" : "outline"} 
                                size="sm" 
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleEditUser(user)}
                            >
                                <Pencil className="h-3 w-3 mr-2" />
                                {isNew ? "Настроить права" : "Редактировать"}
                            </Button>
                            {!isNew && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-3 text-destructive hover:bg-destructive/10"
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

      {/* Диалог редактирования */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Карточка сотрудника</DialogTitle>
                <DialogDescription>
                    Настройка доступа для <b>@{editingUser?.login}</b>
                </DialogDescription>
            </DialogHeader>
            
            {editingUser && (
                <div className="grid gap-4 py-4">
                    {/* Статус (можно менять вручную) */}
                    <div className="grid gap-2">
                        <Label>Статус аккаунта</Label>
                        <Select value={editingUser.status} onValueChange={(v: UserStatus) => setEditingUser({...editingUser, status: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Активен</SelectItem>
                                <SelectItem value="pending">Ожидает подтверждения</SelectItem>
                                <SelectItem value="blocked">Заблокирован</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>ФИО</Label>
                        <Input value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Должность</Label>
                            <Input value={editingUser.position} onChange={(e) => setEditingUser({...editingUser, position: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Роль</Label>
                        <Select value={editingUser.role} onValueChange={(v: UserRole) => setEditingUser({...editingUser, role: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key} disabled={key === 'guest'}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!['admin_system', 'guest'].includes(editingUser.role) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-2">
                            <div className="grid gap-2">
                                <Label>Клиника</Label>
                                <Select value={editingUser.clinicId || ""} onValueChange={(v) => setEditingUser({...editingUser, clinicId: v, departmentId: undefined})}>
                                    <SelectTrigger><SelectValue placeholder="Выберите клинику" /></SelectTrigger>
                                    <SelectContent>
                                        {INITIAL_CLINICS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Отделение</Label>
                                <Select 
                                    value={editingUser.departmentId || ""} 
                                    onValueChange={(v) => setEditingUser({...editingUser, departmentId: v})} 
                                    disabled={!editingUser.clinicId}
                                >
                                    <SelectTrigger><SelectValue placeholder="Выберите отделение" /></SelectTrigger>
                                    <SelectContent>
                                        {availableDepts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleSaveUser}>Сохранить</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}