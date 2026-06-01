"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Wrench,
  Loader2,
  Power,
  PowerOff,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm-dialog/store";
import { cn } from "@/lib/utils";
import {
  RequestClassifierQueryService,
  RequestClassifierCommandService,
  v1RequestType,
} from "@/lib/api-generated";
import { fetchAllPages } from "@/lib/api/paginate";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { invalidateRequestClassifier } from "@/lib/classifiers/request-classifier-store";
import { cleanText } from "@/lib/text";

const getDeclension = (n: number, words: string[]) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[(n % 10 < 5) ? n % 10 : 5]];
};

type FormState = {
  name: string;
  description: string;
};

const EMPTY_FORM: FormState = { name: "", description: "" };

export function RequestTypesView() {
  const { orgId: organizationId, isResolving: isOrgResolving } = useActiveOrgId();
  const confirm = useConfirm();

  const [types, setTypes] = useState<v1RequestType[]>([]);
  const [showInactive, setShowInactive] = useState(true);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const loadTypes = async (orgId: string) => {
    setIsLoading(true);
    try {
      const items = await fetchAllPages<v1RequestType>((cursor) =>
        RequestClassifierQueryService.requestClassifierQueryListRequestTypesByOrganization(orgId, 200, cursor),
      );
      setTypes(items);
      // Все мутации типов заявок проходят через loadTypes — сбрасываем
      // общий кеш, чтобы список заявок подтянул свежие типы.
      invalidateRequestClassifier(orgId);
    } catch (e) {
      console.error("Failed to load request types", e);
      notify.error("Ошибка", "Не удалось загрузить список типов заявок.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOrgResolving) return;
    if (organizationId) {
      void loadTypes(organizationId);
    } else {
      setTypes([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, showInactive, isOrgResolving]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return types;
    return types.filter(
      (t) =>
        (t.name ?? "").toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }, [types, search]);

  const activeCount = types.filter((t) => t.isActive !== false).length;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (t: v1RequestType) => {
    setEditingId(t.id ?? null);
    setForm({
      name: t.name ?? "",
      description: t.description ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!organizationId) return;
    const name = cleanText(form.name);
    const description = cleanText(form.description);
    if (!name) {
      notify.error("Заполните поле", "Название обязательно.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        ...(description ? { description } : {}),
      };
      if (editingId) {
        await RequestClassifierCommandService.requestClassifierCommandUpdateRequestTypeDetails(editingId, payload);
        notify.mutationSuccess("Тип обновлён", "Изменения сохранены.");
      } else {
        await RequestClassifierCommandService.requestClassifierCommandCreateRequestType(organizationId, payload);
        notify.mutationSuccess("Тип создан", `Добавлен тип «${payload.name}».`);
      }
      setIsDialogOpen(false);
      void loadTypes(organizationId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось сохранить тип");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (t: v1RequestType) => {
    if (!t.id || !organizationId) return;
    try {
      await RequestClassifierCommandService.requestClassifierCommandDeactivateRequestType(t.id);
      notify.mutationSuccess("Тип деактивирован", "Сотрудники не смогут выбрать его в новых заявках.");
      void loadTypes(organizationId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось деактивировать тип");
    }
  };

  const handleReactivate = async (t: v1RequestType) => {
    if (!t.id || !organizationId) return;
    try {
      await RequestClassifierCommandService.requestClassifierCommandReactivateRequestType(t.id);
      notify.mutationSuccess("Тип возобновлён", "Снова доступен для выбора в форме.");
      void loadTypes(organizationId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось возобновить тип");
    }
  };

  const handleDelete = async (t: v1RequestType) => {
    if (!t.id || !organizationId) return;
    const ok = await confirm({
      title: "Удалить тип безвозвратно?",
      description: `«${t.name ?? ""}» — действие необратимо.`,
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (!ok) return;
    try {
      await RequestClassifierCommandService.requestClassifierCommandDeleteRequestType(t.id);
      notify.mutationSuccess("Тип удалён", "");
      void loadTypes(organizationId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось удалить тип");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            Типы заявок
            {!isLoading && (
              <span className="text-sm text-muted-foreground font-normal ml-2">
                {activeCount} {getDeclension(activeCount, ["активный", "активных", "активных"])}
                {showInactive && types.length > activeCount && ` из ${types.length}`}
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Сотрудники выбирают тип при создании заявки на обслуживание.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!organizationId} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Новый тип
        </Button>
      </div>

      {!isOrgResolving && !organizationId && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Сначала выберите активную организацию, чтобы управлять типами её заявок.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или описанию"
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm select-none cursor-pointer shrink-0">
          <Switch checked={showInactive} onCheckedChange={setShowInactive} />
          Показывать неактивные
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10 text-sm text-muted-foreground">
          {types.length === 0
            ? "Пока нет ни одного типа. Создайте первый, чтобы сотрудники могли подавать заявки."
            : "Под фильтр ничего не подходит."}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <RequestTypeRow
              key={t.id}
              type={t}
              onEdit={() => openEdit(t)}
              onDeactivate={() => handleDeactivate(t)}
              onReactivate={() => handleReactivate(t)}
              onDelete={() => handleDelete(t)}
            />
          ))}
        </ul>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-0">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактирование типа" : "Новый тип заявки"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rt-name">Название</Label>
              <Input
                id="rt-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Например: Замена картриджа"
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rt-description">Описание (необязательно)</Label>
              <Textarea
                id="rt-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Когда уместно подавать такую заявку, что нужно указать."
                className="min-h-20 resize-none"
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingId ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestTypeRow({
  type,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}: {
  type: v1RequestType;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}) {
  const isInactive = type.isActive === false;

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30",
        isInactive && "opacity-60",
      )}
    >
      <div className="p-2 rounded-md bg-muted text-muted-foreground shrink-0">
        <Wrench className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground line-clamp-1 break-words">
            {type.name || "Без названия"}
          </span>
          {isInactive && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Неактивен
            </Badge>
          )}
        </div>
        {type.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 break-words">
            {type.description}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </DropdownMenuItem>
          {isInactive ? (
            <DropdownMenuItem onClick={onReactivate}>
              <Power className="mr-2 h-4 w-4 text-emerald-500" />
              Возобновить
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onDeactivate}>
              <PowerOff className="mr-2 h-4 w-4" />
              Деактивировать
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить навсегда
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
