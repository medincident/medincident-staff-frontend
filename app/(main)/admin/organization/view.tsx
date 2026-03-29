"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Power,
  PowerOff,
  Building,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  UserCheck,
  ShieldAlert,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Импорт нового сервиса
import { OrganizationsService } from "@/lib/api";

export function OrganizationsView() {
  // --- STATE ---
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Модалка создания/редактирования
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  // Модалка назначения руководителей
  const [isRespDialogOpen, setIsRespDialogOpen] = useState(false);
  const [targetOrgId, setTargetOrgId] = useState<string | null>(null);
  const [responsibles, setResponsibles] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  // 1. ЗАГРУЗКА ДАННЫХ
  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      // Загружаем все организации, включая деактивированные
      const res = await OrganizationsService.listOrganizations(true, search || undefined);
      
      // Подгружаем ответственных для каждой организации, чтобы выводить их в карточке
      const orgsWithResponsibles = await Promise.all(res.items.map(async (org) => {
        const resp = await OrganizationsService.listOrganizationResponsibles(org.id);
        return { ...org, responsibles: resp.items };
      }));
      
      setOrganizations(orgsWithResponsibles);
    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось загрузить список организаций" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [search]);

  // --- HANDLERS: ОРГАНИЗАЦИИ ---
  const openOrgDialog = (org?: any) => {
    if (org) {
      setEditingOrg(org);
      setOrgName(org.name);
      setOrgDescription(org.description || "");
      setOrgAddress(org.legalAddress?.value || "");
    } else {
      setEditingOrg(null);
      setOrgName("");
      setOrgDescription("");
      setOrgAddress("");
    }
    setIsOrgDialogOpen(true);
  };

  const saveOrganization = async () => {
    if (!orgName.trim() || !orgAddress.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: orgName,
        description: orgDescription || null,
        legalAddress: { value: orgAddress }
      };

      if (editingOrg) {
        await OrganizationsService.updateOrganization(editingOrg.id, payload);
        toast.success("Организация обновлена");
      } else {
        await OrganizationsService.createOrganization(payload);
        toast.success("Организация создана");
      }
      setIsOrgDialogOpen(false);
      loadOrganizations();
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleOrgStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await OrganizationsService.deactivateOrganization(id);
        toast.success("Организация деактивирована");
      } else {
        await OrganizationsService.reactivateOrganization(id);
        toast.success("Организация активирована");
      }
      loadOrganizations();
    } catch (error) {
      toast.error("Ошибка изменения статуса");
    }
  };

  const deleteOrg = async (id: string) => {
    if (confirm("Удалить организацию? Это возможно только если в ней нет клиник и сотрудников.")) {
      try {
        await OrganizationsService.deleteOrganization(id);
        toast.success("Организация удалена");
        loadOrganizations();
      } catch (error) {
        toast.error("Ошибка удаления", { description: "Убедитесь, что организация пуста." });
      }
    }
  };

  // --- HANDLERS: ОТВЕТСТВЕННЫЕ ---
  const openResponsiblesDialog = async (orgId: string) => {
    setTargetOrgId(orgId);
    setIsRespDialogOpen(true);
    loadResponsiblesAndCandidates(orgId);
  };

  const loadResponsiblesAndCandidates = async (orgId: string) => {
    try {
      const [respRes, candRes] = await Promise.all([
        OrganizationsService.listOrganizationResponsibles(orgId),
        // includeIneligible=true позволяет показать неактивных/неподходящих кандидатов с объяснением причины
        OrganizationsService.listOrganizationResponsibleCandidates(orgId, undefined, true)
      ]);
      setResponsibles(respRes.items);
      setCandidates(candRes.items);
    } catch (e) {
      toast.error("Ошибка загрузки данных о руководителях");
    }
  };

  const addResponsible = async () => {
    if (!targetOrgId || !selectedCandidateId) return;
    setIsSaving(true);
    try {
      await OrganizationsService.addOrganizationResponsible(targetOrgId, { userId: selectedCandidateId });
      toast.success("Руководитель назначен");
      setSelectedCandidateId("");
      loadResponsiblesAndCandidates(targetOrgId);
      loadOrganizations(); // Обновляем список, чтобы руководитель появился в карточке
    } catch (e) {
      toast.error("Ошибка назначения");
    } finally {
      setIsSaving(false);
    }
  };

  const removeResponsible = async (userId: string) => {
    if (!targetOrgId) return;
    try {
      await OrganizationsService.removeOrganizationResponsible(targetOrgId, userId);
      toast.success("Руководитель снят");
      loadResponsiblesAndCandidates(targetOrgId);
      loadOrganizations();
    } catch (e) {
      toast.error("Ошибка при удалении");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-foreground">Организации</h1>
            <p className="text-sm text-muted-foreground mt-1">Глобальное управление медицинскими сетями</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-2">
          {isLoading ? (
             <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
          ) : (
             <Input 
                placeholder="Поиск организации..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
             />
          )}
          <Button onClick={() => openOrgDialog()} disabled={isLoading} className="w-full sm:w-auto shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading && organizations.length === 0 ? (
           Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : organizations.length === 0 ? (
           <div className="col-span-full py-12 text-center text-muted-foreground">Организации не найдены</div>
        ) : (
          organizations.map((org) => {
            const head = org.responsibles?.find((r: any) => r.isDirectlyAssigned)?.user;

            return (
              <Card key={org.id} className={`transition-all ${org.isActive === false ? 'opacity-70 grayscale-[30%]' : ''}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1 overflow-hidden pr-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary shrink-0" />
                      <CardTitle className="truncate text-lg">{org.name}</CardTitle>
                      {org.isActive === false && <Badge variant="destructive" className="text-[10px]">Неактивна</Badge>}
                    </div>
                    <CardDescription className="flex items-center gap-1 truncate text-xs">
                      <MapPin className="h-3 w-3 shrink-0" /> {org.legalAddress?.value || "Юридический адрес не указан"}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mt-2 -mr-2"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openOrgDialog(org)}>
                        <Pencil className="mr-2 h-4 w-4" /> Настройки
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openResponsiblesDialog(org.id)}>
                        <UserCheck className="mr-2 h-4 w-4" /> Руководители
                      </DropdownMenuItem>
                      {org.isActive !== false ? (
                        <DropdownMenuItem onClick={() => toggleOrgStatus(org.id, true)}>
                          <PowerOff className="mr-2 h-4 w-4" /> Деактивировать
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => toggleOrgStatus(org.id, false)}>
                          <Power className="mr-2 h-4 w-4 text-emerald-500" /> Активировать
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteOrg(org.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Удалить навсегда
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-2">
                  {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Главный Руководитель</p>
                      <p className="text-sm font-medium">{head ? `${head.name || head.givenName}` : <span className="italic text-muted-foreground">Не назначен</span>}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => openResponsiblesDialog(org.id)}>
                      Управление
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* DIALOG: ОРГАНИЗАЦИЯ */}
      <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOrg ? 'Настройки организации' : 'Новая организация'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название *</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="ООО Медицина" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Юридический адрес *</Label>
              <Input value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} placeholder="г. Москва, ул. Ленина, 1" />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} placeholder="Дополнительная информация..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrgDialogOpen(false)}>Отмена</Button>
            <Button onClick={saveOrganization} disabled={!orgName.trim() || !orgAddress.trim() || isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: РУКОВОДИТЕЛИ (С использованием умных кандидатов) */}
      <Dialog open={isRespDialogOpen} onOpenChange={setIsRespDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Руководители организации</DialogTitle>
            <DialogDescription>
              Они получат доступ к управлению всеми клиниками и отделениями этой сети.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* Список текущих руководителей */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Назначенные руководители</Label>
              {responsibles.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                  Нет назначенных руководителей
                </div>
              ) : (
                <div className="divide-y border rounded-lg overflow-hidden">
                  {responsibles.map((r: any) => (
                    <div key={r.user.id} className="flex items-center justify-between p-3 bg-card">
                      <span className="text-sm font-medium">{r.user.name || r.user.givenName}</span>
                      {r.isDirectlyAssigned && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeResponsible(r.user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Добавление нового руководителя */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Назначить нового</Label>
              <div className="flex items-center gap-2">
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Выберите сотрудника..." />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((cand: any) => (
                      <SelectItem 
                        key={cand.user.id} 
                        value={cand.user.id} 
                        disabled={!cand.eligible} // Блокируем неподходящих
                      >
                        <div className="flex flex-col text-left">
                          <span>{cand.user.name || cand.user.givenName}</span>
                          {!cand.eligible && (
                             // Показываем причину, почему нельзя назначить (определяется сервером)
                            <span className="text-[10px] text-destructive flex items-center mt-0.5">
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              {cand.ineligibilityReasons?.[0]?.message || "Нельзя назначить"}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addResponsible} disabled={!selectedCandidateId || isSaving}>
                  Добавить
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}