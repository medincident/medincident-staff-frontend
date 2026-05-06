"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Loader2,
  Megaphone,
  Archive,
  ArchiveRestore,
  Pencil,
  Flag,
  AlertTriangle,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  AnnouncementCommandServiceService,
  AnnouncementQueryServiceService,
  commandAnnouncementV1AnnouncementPriority,
  v1AnnouncementView,
} from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { cleanText } from "@/lib/text";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// HTML datetime-local format: YYYY-MM-DDTHH:mm. На входе ожидаем ISO,
// на выходе тоже ISO; промежуточный формат — для <input type="datetime-local">.
function isoToInput(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function inputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type FormState = {
  title: string;
  content: string;
  priority: commandAnnouncementV1AnnouncementPriority;
  startsAt: string;
  endsAt: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  priority: commandAnnouncementV1AnnouncementPriority.ANNOUNCEMENT_PRIORITY_NORMAL,
  startsAt: "",
  endsAt: "",
};

export function AnnouncementsView() {
  const { orgId: organizationId, isResolving: isOrgResolving } = useActiveOrgId();

  const [items, setItems] = useState<v1AnnouncementView[]>([]);
  const [includeArchived, setIncludeArchived] = useState(true);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const loadAnnouncements = async (orgId: string) => {
    setIsLoading(true);
    try {
      const res = await AnnouncementQueryServiceService.announcementQueryServiceListAnnouncementsForOrganization(
        orgId,
        includeArchived,
        "ANNOUNCEMENT_PRIORITY_UNSPECIFIED",
        100,
      );
      if (res && "items" in res && Array.isArray(res.items)) {
        setItems(res.items);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Failed to load announcements", e);
      notify.error("Ошибка", "Не удалось загрузить список объявлений.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOrgResolving) return;
    if (organizationId) {
      void loadAnnouncements(organizationId);
    } else {
      setItems([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, includeArchived, isOrgResolving]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        (a.title ?? "").toLowerCase().includes(q) ||
        (a.content ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (a: v1AnnouncementView) => {
    setEditingId(a.id ?? null);
    setForm({
      title: a.title ?? "",
      content: a.content ?? "",
      priority:
        (a.priority as unknown as commandAnnouncementV1AnnouncementPriority) ??
        commandAnnouncementV1AnnouncementPriority.ANNOUNCEMENT_PRIORITY_NORMAL,
      startsAt: isoToInput(a.startsAt),
      endsAt: isoToInput(a.endsAt),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!organizationId) return;
    // Бэк-валидация: title min=3/max=200, content min=10/max=5000.
    const title = cleanText(form.title);
    const content = cleanText(form.content);
    if (!title || !content) {
      notify.error("Заполните поля", "Заголовок и содержание обязательны.");
      return;
    }
    if (title.length < 3 || content.length < 10) {
      notify.error("Слишком коротко", "Заголовок ≥ 3 симв., содержание ≥ 10 симв.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await AnnouncementCommandServiceService.announcementCommandServiceUpdateAnnouncement(editingId, {
          title,
          content,
          startsAt: inputToIso(form.startsAt),
          endsAt: inputToIso(form.endsAt),
        });
        const original = items.find((i) => i.id === editingId);
        if (original && (original.priority as any) !== form.priority) {
          await AnnouncementCommandServiceService.announcementCommandServiceUpdateAnnouncementPriority(editingId, {
            priority: form.priority,
          });
        }
        notify.mutationSuccess("Объявление обновлено", "Изменения сохранены.");
      } else {
        await AnnouncementCommandServiceService.announcementCommandServiceCreateAnnouncement({
          organizationId,
          title,
          content,
          priority: form.priority,
          startsAt: inputToIso(form.startsAt),
          endsAt: inputToIso(form.endsAt),
        });
        notify.mutationSuccess("Объявление создано", "Сотрудники увидят его на дашборде.");
      }
      setIsDialogOpen(false);
      void loadAnnouncements(organizationId);
    } catch (e) {
      console.error(e);
      notify.mutationError("Ошибка", "Не удалось сохранить объявление.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (a: v1AnnouncementView) => {
    if (!a.id || !organizationId) return;
    if (!confirm(`Архивировать объявление «${a.title ?? ""}»? Сотрудники перестанут его видеть.`)) {
      return;
    }
    try {
      await AnnouncementCommandServiceService.announcementCommandServiceArchiveAnnouncement(a.id);
      notify.mutationSuccess("Объявление архивировано", "");
      void loadAnnouncements(organizationId);
    } catch (e) {
      console.error(e);
      notify.mutationError("Ошибка", "Не удалось архивировать объявление.");
    }
  };

  const handleUnarchive = async (a: v1AnnouncementView) => {
    if (!a.id || !organizationId) return;
    try {
      await AnnouncementCommandServiceService.announcementCommandServiceUnarchiveAnnouncement(a.id);
      notify.mutationSuccess("Объявление восстановлено", "Снова видно сотрудникам.");
      void loadAnnouncements(organizationId);
    } catch (e) {
      console.error(e);
      notify.mutationError("Ошибка", "Не удалось восстановить объявление.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Объявления
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управляйте сообщениями, которые сотрудники видят на дашборде.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!organizationId} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Новое объявление
        </Button>
      </div>

      {!isOrgResolving && !organizationId && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Сначала выберите активную организацию, чтобы управлять её объявлениями.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по заголовку или тексту"
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm select-none cursor-pointer shrink-0">
          <Switch
            checked={includeArchived}
            onCheckedChange={setIncludeArchived}
          />
          Показывать архив
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <AlertTriangle className="h-8 w-8 mx-auto opacity-40" />
            <p className="text-sm">
              {items.length === 0
                ? "Пока нет ни одного объявления. Создайте первое."
                : "Под фильтр ничего не подходит."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <AnnouncementRow
              key={a.id}
              announcement={a}
              onEdit={() => openEdit(a)}
              onArchive={() => handleArchive(a)}
              onUnarchive={() => handleUnarchive(a)}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-0 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактирование объявления" : "Новое объявление"}</DialogTitle>
            <DialogDescription>
              Объявление будет видно всем сотрудникам организации на дашборде.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Заголовок</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Например: Профилактические работы 12 мая"
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ann-content">Содержание</Label>
              <Textarea
                id="ann-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Кратко: что произойдёт, кого это затрагивает, что делать."
                className="min-h-28 resize-none"
                maxLength={2000}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Flag className="h-3.5 w-3.5" />
                Приоритет
              </Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm({ ...form, priority: v as commandAnnouncementV1AnnouncementPriority })
                }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={commandAnnouncementV1AnnouncementPriority.ANNOUNCEMENT_PRIORITY_NORMAL}>
                    Обычный
                  </SelectItem>
                  <SelectItem value={commandAnnouncementV1AnnouncementPriority.ANNOUNCEMENT_PRIORITY_HIGH}>
                    Высокий — будет выделен на дашборде
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ann-starts-at">Начало (необязательно)</Label>
                <Input
                  id="ann-starts-at"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ann-ends-at">Окончание (необязательно)</Label>
                <Input
                  id="ann-ends-at"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Если оставить даты пустыми — объявление будет показано постоянно, пока не будет архивировано.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !form.title.trim() || !form.content.trim()}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingId ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementRow({
  announcement,
  onEdit,
  onArchive,
  onUnarchive,
}: {
  announcement: v1AnnouncementView;
  onEdit: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const isHigh = announcement.priority === "ANNOUNCEMENT_PRIORITY_HIGH";
  const isArchived = announcement.isArchived === true;

  return (
    <Card
      className={cn(
        "transition-colors",
        isArchived && "opacity-70",
        !isArchived && isHigh && "border-warning/40 bg-warning/5",
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-foreground line-clamp-2 break-words">
                {announcement.title || "Без заголовка"}
              </h3>
              {isHigh && (
                <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px] uppercase tracking-wider">
                  Высокий
                </Badge>
              )}
              {isArchived && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  Архив
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
              {announcement.content}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span>Создано: <b className="text-foreground">{fmtDate(announcement.createdAt)}</b></span>
          {announcement.startsAt && (
            <span>С: <b className="text-foreground">{fmtDate(announcement.startsAt)}</b></span>
          )}
          {announcement.endsAt && (
            <span>До: <b className="text-foreground">{fmtDate(announcement.endsAt)}</b></span>
          )}
          {announcement.viewCount && (
            <span>Просмотров: <b className="text-foreground">{announcement.viewCount}</b></span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Редактировать
          </Button>
          {isArchived ? (
            <Button variant="outline" size="sm" onClick={onUnarchive}>
              <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" />
              Восстановить
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              Архивировать
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
