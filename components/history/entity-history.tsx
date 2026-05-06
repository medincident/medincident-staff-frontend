"use client";

import { useEffect, useMemo, useState } from "react";
import {
  History as HistoryIcon,
  ArrowRight,
  CircleDot,
  Flag,
  UserPlus,
  Inbox,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { INCIDENT_PRIORITY_MAP } from "@/lib/constants";
import {
  IncidentQueryServiceService,
  ServiceRequestQueryServiceService,
} from "@/lib/api-generated";

type EntityType = "incident" | "request";

type HistoryItem = {
  id: string;
  changedAt: string;
  actorName: string;
  type: "status" | "priority" | "executor";
  title: string;
  detail: React.ReactNode;
};

// Дружественные подписи статусов и действий — без зависимости от UI-карт
// (которые местами используют другие ключи). Ключи в нижнем регистре,
// сравниваем после удаления префикса вида INCIDENT_STATUS_.
const INCIDENT_STATUS_LABEL: Record<string, string> = {
  pending: "Принята",
  in_progress: "В работе",
  done: "Завершено",
  rejected: "Отклонено",
  cancelled: "Отменено",
  unspecified: "—",
};

const REQUEST_STATUS_LABEL: Record<string, string> = {
  created: "Создана",
  in_work: "В работе",
  purchase: "Закупка",
  completed: "Выполнена",
  refused: "Отказ",
  cancelled: "Отменена",
  unspecified: "—",
};

const EXECUTOR_ACTION_LABEL: Record<string, string> = {
  assigned: "назначен исполнителем",
  unassigned: "снят с заявки",
  replaced: "заменён",
};

function stripPrefix(value: string | undefined, prefix: string): string {
  return (value ?? "").toLowerCase().replace(prefix, "") || "unspecified";
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
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

export function EntityHistory({
  entityType,
  entityId,
}: {
  entityType: EntityType;
  entityId: string;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        if (entityType === "incident") {
          const res = await IncidentQueryServiceService.incidentQueryServiceGetIncidentHistory(entityId);
          if (cancelled) return;

          const collected: HistoryItem[] = [];

          if (res && "statusHistory" in res && Array.isArray(res.statusHistory)) {
            for (const e of res.statusHistory) {
              const fromKey = stripPrefix(e.oldStatus, "incident_status_");
              const toKey = stripPrefix(e.newStatus, "incident_status_");
              collected.push({
                id: e.id ?? `s-${e.changedAt}`,
                changedAt: e.changedAt ?? "",
                actorName: e.actor?.displayName ?? "—",
                type: "status",
                title: "Изменён статус",
                detail: (
                  <span>
                    <b>{INCIDENT_STATUS_LABEL[fromKey] ?? fromKey}</b>{" "}
                    <ArrowRight className="inline h-3 w-3 align-text-bottom mx-0.5 opacity-60" />{" "}
                    <b>{INCIDENT_STATUS_LABEL[toKey] ?? toKey}</b>
                  </span>
                ),
              });
            }
          }

          if (res && "priorityHistory" in res && Array.isArray(res.priorityHistory)) {
            for (const e of res.priorityHistory) {
              const fromKey = stripPrefix(e.oldPriority, "incident_priority_");
              const toKey = stripPrefix(e.newPriority, "incident_priority_");
              collected.push({
                id: e.id ?? `p-${e.changedAt}`,
                changedAt: e.changedAt ?? "",
                actorName: e.actor?.displayName ?? "—",
                type: "priority",
                title: "Изменён приоритет",
                detail: (
                  <span>
                    <b>{INCIDENT_PRIORITY_MAP[fromKey] ?? fromKey}</b>{" "}
                    <ArrowRight className="inline h-3 w-3 align-text-bottom mx-0.5 opacity-60" />{" "}
                    <b>{INCIDENT_PRIORITY_MAP[toKey] ?? toKey}</b>
                  </span>
                ),
              });
            }
          }

          if (!cancelled) setItems(collected);
        } else {
          const res = await ServiceRequestQueryServiceService.serviceRequestQueryServiceGetServiceRequestHistory(entityId);
          if (cancelled) return;

          const collected: HistoryItem[] = [];

          if (res && "statusHistory" in res && Array.isArray(res.statusHistory)) {
            for (const e of res.statusHistory) {
              const fromKey = stripPrefix(e.oldStatus, "service_request_status_");
              const toKey = stripPrefix(e.newStatus, "service_request_status_");
              collected.push({
                id: e.id ?? `s-${e.changedAt}`,
                changedAt: e.changedAt ?? "",
                actorName: e.actorName ?? "—",
                type: "status",
                title: "Изменён статус",
                detail: (
                  <span>
                    <b>{REQUEST_STATUS_LABEL[fromKey] ?? fromKey}</b>{" "}
                    <ArrowRight className="inline h-3 w-3 align-text-bottom mx-0.5 opacity-60" />{" "}
                    <b>{REQUEST_STATUS_LABEL[toKey] ?? toKey}</b>
                  </span>
                ),
              });
            }
          }

          if (res && "executorHistory" in res && Array.isArray(res.executorHistory)) {
            for (const e of res.executorHistory) {
              const action = (e.action ?? "").toLowerCase();
              collected.push({
                id: e.id ?? `e-${e.changedAt}`,
                changedAt: e.changedAt ?? "",
                actorName: e.actorName ?? "—",
                type: "executor",
                title: "Исполнитель",
                detail: (
                  <span>
                    <b>{e.employeeName ?? e.employeeId ?? "—"}</b>{" "}
                    {EXECUTOR_ACTION_LABEL[action] ?? action ?? "изменён"}
                  </span>
                ),
              });
            }
          }

          if (!cancelled) setItems(collected);
        }
      } catch (e) {
        console.error("Failed to load history", e);
        if (!cancelled) setError("Не удалось загрузить историю.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  // Сортируем по убыванию даты — последние события сверху
  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
      ),
    [items],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" />
          История изменений
        </CardTitle>
        <CardDescription>
          Хронологический список изменений статуса{entityType === "incident" ? ", приоритета" : " и назначенного исполнителя"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : sortedItems.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/40 border text-muted-foreground text-sm">
            <Inbox className="h-5 w-5 shrink-0 opacity-70" />
            История пока пуста — изменений не было.
          </div>
        ) : (
          <ol className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
            {sortedItems.map((it) => (
              <li key={it.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 bg-background",
                    it.type === "status" && "border-info",
                    it.type === "priority" && "border-warning",
                    it.type === "executor" && "border-primary",
                  )}
                />
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                    {it.type === "status" && <CircleDot className="h-3 w-3" />}
                    {it.type === "priority" && <Flag className="h-3 w-3" />}
                    {it.type === "executor" && <UserPlus className="h-3 w-3" />}
                    {it.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {fmtDate(it.changedAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-0.5">{it.detail}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Автор: <span className="text-foreground">{it.actorName}</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
