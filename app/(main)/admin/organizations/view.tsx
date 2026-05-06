"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Building,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Users,
  Hospital,
  Stethoscope,
  Palmtree,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { notify } from "@/lib/toast";
import {
  OrgStructureQueryServiceService,
  OrgStructureCommandServiceService,
  MembershipQueryServiceService,
  MembershipCommandServiceService,
  StatsQueryServiceService,
} from "@/lib/api-generated";
import { cleanText } from "@/lib/text";
import { useSession } from "next-auth/react";

export function OrganizationsView() {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const res = await OrgStructureQueryServiceService.orgStructureQueryServiceListOrganizations(100);
      const items = (res as any).items || [];

      const filtered = search
        ? items.filter((o: any) => o.name?.toLowerCase().includes(search.toLowerCase()))
        : items;

      const orgsWithDetails = await Promise.all(filtered.map(async (org: any) => {
        const [headRes, statsRes] = await Promise.all([
          MembershipQueryServiceService.membershipQueryServiceListOrgHeads(org.id, 1).catch(() => null),
          StatsQueryServiceService.statsQueryServiceGetOrganizationStats(org.id).catch(() => null),
        ]);
        const head = (headRes as any)?.items?.[0] ?? null;
        const stats = (statsRes as any)?.stats ?? null;
        return { ...org, head, stats };
      }));

      setOrganizations(orgsWithDetails);
    } catch (error) {
      notify.error("Ошибка", "Не удалось загрузить список организаций.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [search]);

  const openOrgDialog = (org?: any) => {
    if (org) {
      setEditingOrg(org);
      setOrgName(org.name || "");
      setOrgDescription(org.description || "");
      setOrgAddress(org.legalAddress || "");
    } else {
      setEditingOrg(null);
      setOrgName("");
      setOrgDescription("");
      setOrgAddress("");
    }
    setIsOrgDialogOpen(true);
  };

  const saveOrganization = async () => {
    // Бэк-валидация: name min=2/max=256, legalAddress.text min=4/max=128,
    // description omitnil min=8/max=2048 — пустую строку не шлём, иначе
    // omitnil не сработает.
    const name = cleanText(orgName) ?? "";
    const addressText = cleanText(orgAddress) ?? "";
    const description = cleanText(orgDescription);
    if (name.length < 2 || addressText.length < 4) {
      notify.error("Проверьте поля", "Название (≥ 2 символа) и адрес (≥ 4 символа) обязательны.");
      return;
    }
    if (description !== undefined && description.length < 8) {
      notify.error("Проверьте описание", "Описание должно быть ≥ 8 символов либо пустым.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingOrg) {
        await OrgStructureCommandServiceService.orgStructureCommandServiceUpdateOrganizationDetails(editingOrg.id, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
        await OrgStructureCommandServiceService.orgStructureCommandServiceUpdateOrganizationLegalAddress(editingOrg.id, {
          legalAddress: { text: addressText },
        });
        notify.mutationSuccess("Организация обновлена", "Данные организации успешно сохранены.");
      } else {
        await OrgStructureCommandServiceService.orgStructureCommandServiceCreateOrganization({
          name,
          ...(description !== undefined ? { description } : {}),
          legalAddress: { text: addressText },
        });
        notify.mutationSuccess("Организация создана", "Новая организация добавлена в систему.");
      }
      setIsOrgDialogOpen(false);
      loadOrganizations();
    } catch (error) {
      notify.mutationError("Ошибка сохранения", "Не удалось сохранить данные организации.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Организации</h1>
          <p className="text-sm text-muted-foreground mt-1">Глобальное управление медицинскими сетями</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading && organizations.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : organizations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Организации не найдены</div>
        ) : (
          organizations.map((org) => {
            const head = org.head;
            const headName = head
              ? (head.displayName || `${head.firstName || ""} ${head.lastName || ""}`.trim())
              : null;

            return (
              <Card key={org.id} className="gap-2 transition-all">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1 overflow-hidden pr-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary shrink-0" />
                      <CardTitle className="truncate text-lg">{org.name}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1 truncate text-xs">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {org.legalAddress || "Юридический адрес не указан"}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openOrgDialog(org)}>
                        <Pencil className="mr-2 h-4 w-4" /> Настройки
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
                      <p className="text-sm font-medium">
                        {headName
                          ? headName
                          : <span className="italic text-muted-foreground">Не назначен</span>}
                      </p>
                    </div>
                  </div>

                  {org.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <StatTile icon={Hospital} label="Клиник" value={org.stats.clinicsTotal} />
                      <StatTile icon={Stethoscope} label="Отделений" value={org.stats.departmentsTotal} />
                      <StatTile icon={Users} label="Сотрудников" value={org.stats.employeesTotal} />
                      <StatTile icon={Palmtree} label="В отпуске" value={org.stats.employeesOnVacation} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOrg ? "Настройки организации" : "Новая организация"}</DialogTitle>
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
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
}) {
  const display = value === undefined || value === null || value === "" ? "—" : value;
  return (
    <div className="flex items-center gap-2 p-2 rounded-md border bg-background">
      <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-sm font-bold text-foreground truncate">{display}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  );
}
