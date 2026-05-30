"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ClipboardCheck, CalendarDays, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { notify } from "@/lib/toast";
import { cleanText } from "@/lib/text";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useRequirePermission } from "@/lib/auth/use-require-permission";
import { useIncidentClassifier } from "@/lib/classifiers/incident-classifier-store";
import { useCapaStore, type CapaEntry } from "@/lib/capa/store";

const EMPTY = { categoryId: "", title: "", description: "", introducedAt: "" };

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

export function CapaView() {
  useRequirePermission("canManageClassifiers");
  const { orgId } = useActiveOrgId();
  const { categories } = useIncidentClassifier(orgId);

  const entries = useCapaStore((s) => s.entries);
  const add = useCapaStore((s) => s.add);
  const update = useCapaStore((s) => s.update);
  const remove = useCapaStore((s) => s.remove);

  const orgEntries = useMemo(
    () =>
      entries
        .filter((e) => e.organizationId === orgId)
        .sort((a, b) => b.introducedAt.localeCompare(a.introducedAt)),
    [entries, orgId],
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.id && c.name)
        .map((c) => ({ value: c.id as string, label: c.name as string })),
    [categories],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setIsOpen(true);
  };

  const openEdit = (e: CapaEntry) => {
    setEditingId(e.id);
    setForm({
      categoryId: e.categoryId,
      title: e.title,
      description: e.description,
      introducedAt: e.introducedAt,
    });
    setIsOpen(true);
  };

  const save = () => {
    if (!orgId) {
      notify.error("Нет организации", "Сначала выберите активную организацию.");
      return;
    }
    const title = cleanText(form.title);
    if (!title) {
      notify.error("Заполните поле", "Название мероприятия обязательно.");
      return;
    }
    if (!form.categoryId) {
      notify.error("Заполните поле", "Выберите категорию НС.");
      return;
    }
    if (!form.introducedAt) {
      notify.error("Заполните поле", "Укажите дату ввода.");
      return;
    }
    const categoryName =
      categoryOptions.find((o) => o.value === form.categoryId)?.label ?? "Без категории";
    const payload = {
      categoryId: form.categoryId,
      categoryName,
      title,
      description: cleanText(form.description) ?? "",
      introducedAt: form.introducedAt,
    };

    if (editingId) {
      update(editingId, payload);
      notify.success("Сохранено", "Мероприятие обновлено.");
    } else {
      add(orgId, payload);
      notify.success("Добавлено", "Корректирующее мероприятие создано.");
    }
    setIsOpen(false);
  };

  const del = (e: CapaEntry) => {
    remove(e.id);
    notify.success("Удалено", `«${e.title}» убрано из списка.`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Корректирующие мероприятия
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Учёт CAPA по приказу № 785н. Даты ввода отмечаются на графике прогноза в отчётах.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Новое мероприятие
        </Button>
      </div>

      {orgEntries.length === 0 ? (
        <div className="flex items-center gap-3 p-6 rounded-lg bg-muted/40 border text-muted-foreground text-sm">
          <Inbox className="h-5 w-5 shrink-0 opacity-70" />
          Мероприятий пока нет. Добавьте первое — после ввода его дата появится вертикальной линией
          на графике динамики НС в разделе «Отчёты».
        </div>
      ) : (
        <div className="grid gap-3">
          {orgEntries.map((e) => (
            <Card key={e.id} className="overflow-hidden">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{e.title}</span>
                    <Badge variant="outline" className="text-[11px]">
                      {e.categoryName}
                    </Badge>
                  </div>
                  {e.description && (
                    <p className="text-sm text-muted-foreground break-words">{e.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Введено: {fmtDate(e.introducedAt)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(e)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => del(e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Изменить мероприятие" : "Новое корректирующее мероприятие"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Категория НС</Label>
              <SearchableSelect
                options={categoryOptions}
                value={form.categoryId}
                onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                placeholder="Выберите категорию"
              />
            </div>
            <div className="grid gap-2">
              <Label>Название мероприятия</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Напр. «Нескользящие коврики в палатах»"
              />
            </div>
            <div className="grid gap-2">
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Что внедрено и зачем (необязательно)"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Дата ввода</Label>
              <Input
                type="date"
                value={form.introducedAt}
                onChange={(e) => setForm((f) => ({ ...f, introducedAt: e.target.value }))}
                className="w-fit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={save}>{editingId ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
