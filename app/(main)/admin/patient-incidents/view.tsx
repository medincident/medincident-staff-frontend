"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm-dialog/store";
import {
  IncidentBufferCommandService,
  IncidentQueryService,
  OrgStructureQueryService,
  v1BufferEntryView,
  v1BufferStatus,
} from "@/lib/api-generated";
import { fetchAllPages } from "@/lib/api/paginate";
import { usePaginatedList } from "@/lib/api/use-paginated-list";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useRequirePermission } from "@/lib/auth/use-require-permission";
import { usePermissions } from "@/lib/auth/use-permissions";
import { useIncidentClassifier } from "@/lib/classifiers/incident-classifier-store";
import { getBadgeColor } from "@/lib/status-helper";

const STATUS_LABEL: Record<v1BufferStatus, string> = {
  [v1BufferStatus.BUFFER_STATUS_UNSPECIFIED]: "—",
  [v1BufferStatus.BUFFER_STATUS_PENDING]: "Ожидает решения",
  [v1BufferStatus.BUFFER_STATUS_PUBLISHED]: "Опубликовано",
  [v1BufferStatus.BUFFER_STATUS_REJECTED]: "Отклонено",
  [v1BufferStatus.BUFFER_STATUS_CANCELLED]: "Отозвано пациентом",
};
const STATUS_INTENT_KEY: Record<v1BufferStatus, string> = {
  [v1BufferStatus.BUFFER_STATUS_UNSPECIFIED]: "muted",
  [v1BufferStatus.BUFFER_STATUS_PENDING]: "warning",
  [v1BufferStatus.BUFFER_STATUS_PUBLISHED]: "completed",
  [v1BufferStatus.BUFFER_STATUS_REJECTED]: "cancelled",
  [v1BufferStatus.BUFFER_STATUS_CANCELLED]: "muted",
};

// Бэк отдаёт priority в коротком виде: "normal" | "high" (без префикса
// BUFFER_PRIORITY_, в отличие от status). Подстраиваемся под обе формы.
const PRIORITY_LABEL: Record<string, string> = {
  normal: "Обычный",
  high: "Высокий",
};
function priorityKey(raw?: string): string {
  if (!raw) return "";
  return raw.toLowerCase().replace("buffer_priority_", "");
}

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

export function PatientIncidentsView() {
  useRequirePermission("canReviewPatientIncidents");
  const { orgId } = useActiveOrgId();
  const confirm = useConfirm();
  const { categories, types } = useIncidentClassifier(orgId);
  const perms = usePermissions();
  // Бэк (publish/reject) требует dispatcher employee. У остальных ролей —
  // read-only режим: видят список и могут отклонять? Нет, reject тоже требует
  // dispatcher. Поэтому действия скрыты целиком, у не-диспетчеров.
  const canModerate = perms.canModeratePatientIncidents;

  // Фильтр статуса. PENDING — то, что админу реально нужно по умолчанию.
  const [statusFilter, setStatusFilter] = useState<v1BufferStatus | "ALL">(
    v1BufferStatus.BUFFER_STATUS_PENDING,
  );

  // Дерево клиника→отделения для выбора departmentId при публикации.
  const [clinics, setClinics] = useState<
    { id: string; name: string; departments: { id: string; name: string }[] }[]
  >([]);

  const [publishTarget, setPublishTarget] = useState<v1BufferEntryView | null>(null);
  const [publishDept, setPublishDept] = useState<string>("");
  const [publishCategory, setPublishCategory] = useState<string>("");
  const [publishType, setPublishType] = useState<string>("");
  const [publishDesc, setPublishDesc] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Bump-токен — изменение в deps хука перезагрузит первую страницу.
  const [refreshTick, setRefreshTick] = useState(0);

  const statuses = statusFilter === "ALL" ? undefined : [statusFilter];
  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedList<v1BufferEntryView>(
    (cursor) =>
      IncidentQueryService.incidentQueryListBufferEntries(orgId!, statuses, 20, cursor),
    {
      deps: [orgId, statusFilter, refreshTick],
      enabled: !!orgId,
    },
  );

  const loadEntries = useCallback(() => setRefreshTick((t) => t + 1), []);

  // Подтягиваем структуру для select-а отделения при публикации.
  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const cItems = await fetchAllPages<{ id: string; name: string }>((cursor) =>
          OrgStructureQueryService.orgStructureQueryListClinicsByOrganization(orgId, 200, cursor),
        );
        const built = await Promise.all(
          cItems.map(async (c) => {
            const dItems = await fetchAllPages<{ id: string; name: string }>((cursor) =>
              OrgStructureQueryService.orgStructureQueryListDepartmentsByClinic(c.id, 200, cursor),
            ).catch(() => [] as { id: string; name: string }[]);
            return { id: c.id, name: c.name, departments: dItems };
          }),
        );
        if (!cancelled) setClinics(built);
      } catch (e) {
        console.warn("[buffer] failed to load clinics tree", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const typeNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of types) if (t.id && t.name) map[t.id] = t.name;
    return map;
  }, [types]);
  const categoryNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) if (c.id && c.name) map[c.id] = c.name;
    return map;
  }, [categories]);

  // Опции для SearchableSelect отделений: «Клиника / Отделение».
  const deptOptions = useMemo(
    () =>
      clinics.flatMap((c) =>
        c.departments.map((d) => ({ value: d.id, label: `${c.name} / ${d.name}` })),
      ),
    [clinics],
  );
  const categoryOptions = useMemo(
    () => categories.filter((c) => c.id && c.name).map((c) => ({ value: c.id!, label: c.name! })),
    [categories],
  );
  const typeOptionsForCategory = useMemo(() => {
    if (!publishCategory) return [];
    return types
      .filter((t) => t.id && t.name && t.categoryId === publishCategory)
      .map((t) => ({ value: t.id!, label: t.name! }));
  }, [types, publishCategory]);

  const openPublish = (entry: v1BufferEntryView) => {
    setPublishTarget(entry);
    setPublishDept("");
    // Если пациент выбрал категорию/тип — используем как preselect.
    setPublishCategory(entry.categoryId ?? "");
    setPublishType(entry.typeId ?? "");
    setPublishDesc(entry.description ?? "");
  };

  const handlePublish = async () => {
    if (!publishTarget?.id) return;
    if (!publishDept || !publishCategory || !publishType) {
      notify.error("Заполните поля", "Отделение, категория и тип обязательны.");
      return;
    }
    setIsPublishing(true);
    try {
      await IncidentBufferCommandService.incidentBufferCommandPublishPatientIncident(
        publishTarget.id,
        {
          departmentId: publishDept,
          categoryId: publishCategory,
          typeId: publishType,
          description: publishDesc.trim() || undefined,
        },
      );
      notify.mutationSuccess("Опубликовано", "Заявка пациента добавлена в журнал НС.");
      setPublishTarget(null);
      void loadEntries();
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось опубликовать заявку");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReject = async (entry: v1BufferEntryView) => {
    if (!entry.id) return;
    const ok = await confirm({
      title: "Отклонить заявку пациента?",
      description: "Решение можно объяснить пациенту отдельно — после отклонения он увидит статус «Отклонено».",
      confirmLabel: "Отклонить",
      destructive: true,
    });
    if (!ok) return;
    try {
      await IncidentBufferCommandService.incidentBufferCommandRejectPatientIncident(entry.id);
      notify.mutationSuccess("Отклонено", "Заявка не будет опубликована.");
      void loadEntries();
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось отклонить заявку");
    }
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground inline-flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" /> Заявки от пациентов
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Входящие НС, поданные пациентами через приложение. Одобрите —
            заявка попадёт в журнал НС, отклоните — пациент увидит соответствующий статус.
          </p>
          {!canModerate && (
            <p className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-md px-3 py-2 mt-2">
              У вас нет роли диспетчера — действия по одобрению и отклонению заявок недоступны. Можно только просматривать.
            </p>
          )}
        </div>

        <div className="w-full sm:w-[240px]">
          <Label className="text-xs text-muted-foreground mb-1 block">Статус</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as v1BufferStatus | "ALL")}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={v1BufferStatus.BUFFER_STATUS_PENDING}>
                {STATUS_LABEL[v1BufferStatus.BUFFER_STATUS_PENDING]}
              </SelectItem>
              <SelectItem value={v1BufferStatus.BUFFER_STATUS_PUBLISHED}>
                {STATUS_LABEL[v1BufferStatus.BUFFER_STATUS_PUBLISHED]}
              </SelectItem>
              <SelectItem value={v1BufferStatus.BUFFER_STATUS_REJECTED}>
                {STATUS_LABEL[v1BufferStatus.BUFFER_STATUS_REJECTED]}
              </SelectItem>
              <SelectItem value={v1BufferStatus.BUFFER_STATUS_CANCELLED}>
                {STATUS_LABEL[v1BufferStatus.BUFFER_STATUS_CANCELLED]}
              </SelectItem>
              <SelectItem value="ALL">Все статусы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            {statusFilter === v1BufferStatus.BUFFER_STATUS_PENDING
              ? "Новых заявок от пациентов нет — всё разобрано."
              : "В этом фильтре заявок нет."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((entry) => {
            const isPending = entry.status === v1BufferStatus.BUFFER_STATUS_PENDING;
            const intent = STATUS_INTENT_KEY[entry.status ?? v1BufferStatus.BUFFER_STATUS_UNSPECIFIED];
            const catName = entry.categoryId ? categoryNamesMap[entry.categoryId] : null;
            const typeName = entry.typeId ? typeNamesMap[entry.typeId] : null;
            return (
              <Card key={entry.id} className="p-0 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 px-2 ${getBadgeColor(intent)}`}
                        >
                          {STATUS_LABEL[entry.status ?? v1BufferStatus.BUFFER_STATUS_UNSPECIFIED]}
                        </Badge>
                        {(() => {
                          const pk = priorityKey(entry.priority);
                          if (!pk || pk === "unspecified") return null;
                          return (
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-5 px-2 ${getBadgeColor(pk === "high" ? "high" : "normal")}`}
                            >
                              {PRIORITY_LABEL[pk] ?? pk}
                            </Badge>
                          );
                        })()}
                        {entry.publishedIncidentId && (
                          <Link
                            href={`/events/${entry.publishedIncidentId}`}
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Открыть событие
                          </Link>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-sm leading-snug">
                        {entry.summary || typeName || "Заявка пациента"}
                      </h3>
                      {(catName || typeName) && (
                        <p className="text-xs text-muted-foreground">
                          {catName}
                          {catName && typeName && " · "}
                          {typeName}
                        </p>
                      )}
                    </div>
                  </div>

                  {entry.description && (
                    <p className="text-sm text-foreground bg-muted/30 border rounded-md p-3 whitespace-pre-wrap">
                      {entry.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Подано: {fmtDate(entry.createdAt)}
                    </span>
                    {entry.occurredAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Произошло: {fmtDate(entry.occurredAt)}
                      </span>
                    )}
                    {entry.patientZitadelUserId && (
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        Пациент: {entry.patientZitadelUserId.slice(0, 8)}…
                      </span>
                    )}
                  </div>

                  {isPending && canModerate && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Button onClick={() => openPublish(entry)} className="flex-1 sm:flex-none">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Одобрить и опубликовать
                      </Button>
                      <Button
                        onClick={() => handleReject(entry)}
                        variant="outline"
                        className="flex-1 sm:flex-none text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Отклонить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <InfiniteScrollSentinel
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        </div>
      )}

      <Dialog open={!!publishTarget} onOpenChange={(o) => !o && !isPublishing && setPublishTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Опубликовать как НС</DialogTitle>
            <DialogDescription>
              Заявка попадёт в журнал НС от имени пациента. Выберите отделение,
              категорию и тип. Описание можно уточнить.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Отделение</Label>
              <SearchableSelect
                value={publishDept}
                onChange={setPublishDept}
                options={deptOptions}
                placeholder="Выберите отделение"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Категория НС</Label>
                <SearchableSelect
                  value={publishCategory}
                  onChange={(v) => {
                    setPublishCategory(v);
                    // если меняем категорию, текущий тип может быть из другой — сбрасываем
                    if (publishType && !types.find((t) => t.id === publishType && t.categoryId === v)) {
                      setPublishType("");
                    }
                  }}
                  options={categoryOptions}
                  placeholder="Выберите категорию"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Тип НС</Label>
                <SearchableSelect
                  value={publishType}
                  onChange={setPublishType}
                  options={typeOptionsForCategory}
                  placeholder={publishCategory ? "Выберите тип" : "Сначала выберите категорию"}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <textarea
                value={publishDesc}
                onChange={(e) => setPublishDesc(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Описание ситуации (можно отредактировать)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishTarget(null)} disabled={isPublishing}>
              Отмена
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Опубликовать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
