"use client";

import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Clock,
  Download,
  FileText,
  Minus,
  RotateCcw,
  Siren,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DynamicChart } from "@/components/charts/dynamic-chart";
import { cn } from "@/lib/utils";
import { enrichChartData } from "@/lib/status-helper";
import {
  EVENT_STATUS_MAP,
  PRIORITY_MAP,
  STATUS_MAP,
} from "@/lib/constants";
import type { EventStatus, Priority, RequestStatus } from "@/lib/types";
import { useSession } from "next-auth/react";
import {
  AnalyticsQueryService
} from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useRequirePermission } from "@/lib/auth/use-require-permission";
import { useMyEmployee } from "@/lib/auth/use-my-employee";
import {
  exportPdf,
  type ExportPayload,
  type ExportSummary,
  type ExportTimeSeriesBucket,
} from "@/lib/reports/export";
import { forecastHolt, type ForecastResult } from "@/lib/analytics/forecast";
import {
  detectChangePoints,
  type ChangePoint,
} from "@/lib/analytics/change-points";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { useCapaStore } from "@/lib/capa/store";
import { Sparkles, Brain, Loader2, GitBranch, Filter } from "lucide-react";

const PERIODS = [
  { value: "7d", label: "Последние 7 дней", days: 7 },
  { value: "30d", label: "Последние 30 дней", days: 30 },
  { value: "90d", label: "Последние 90 дней", days: 90 },
  { value: "365d", label: "За год", days: 365 },
  { value: "all", label: "Всё время", days: 9999 },
  { value: "custom", label: "Произвольный период", days: 0 },
] as const;

type PeriodValue = (typeof PERIODS)[number]["value"];

const ACTIVE_REQUEST_STATUSES: RequestStatus[] = [
  "created",
  "in_work",
  "on_hold",
  "pending_review",
];
const ACTIVE_EVENT_STATUSES: EventStatus[] = [
  "created",
  "in_work",
  "investigation",
  "measures",
];

const DAY_MS = 86_400_000;
const ANOMALY_Z_THRESHOLD = 2;

// Бэк отдаёт int64 в JSON как строку (grpc-gateway), приводим к числу.
function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapSummary(raw: Record<string, unknown>): ExportSummary | undefined {
  const inc = (raw.incidents as Record<string, unknown> | undefined) ?? undefined;
  if (!inc) return undefined;
  const bs = (inc.byStatus as Record<string, unknown> | undefined) ?? {};
  const bp = (inc.byPriority as Record<string, unknown> | undefined) ?? {};
  const bso = (inc.bySource as Record<string, unknown> | undefined) ?? {};
  const r = (inc.resolution as Record<string, unknown> | undefined) ?? undefined;
  return {
    total: toNum(inc.total),
    byStatus: {
      pending: toNum(bs.pending),
      inProgress: toNum(bs.inProgress),
      done: toNum(bs.done),
      rejected: toNum(bs.rejected),
      cancelled: toNum(bs.cancelled),
    },
    byPriority: {
      low: toNum(bp.low),
      normal: toNum(bp.normal),
      high: toNum(bp.high),
      critical: toNum(bp.critical),
    },
    bySource: {
      staff: toNum(bso.staff),
      patient: toNum(bso.patient),
    },
    reopened: toNum(inc.reopened),
    withLinkedRequests: toNum(inc.withLinkedRequests),
    resolution: r
      ? {
          avgMinutes: typeof r.avgMinutes === "number" ? r.avgMinutes : toNum(r.avgMinutes),
          minMinutes: typeof r.minMinutes === "number" ? r.minMinutes : toNum(r.minMinutes),
          maxMinutes: typeof r.maxMinutes === "number" ? r.maxMinutes : toNum(r.maxMinutes),
          p50Minutes: typeof r.p50Minutes === "number" ? r.p50Minutes : toNum(r.p50Minutes),
          p90Minutes: typeof r.p90Minutes === "number" ? r.p90Minutes : toNum(r.p90Minutes),
          p95Minutes: typeof r.p95Minutes === "number" ? r.p95Minutes : toNum(r.p95Minutes),
        }
      : undefined,
    topCategories: ((inc.topCategories as Array<Record<string, unknown>> | undefined) ?? []).map((c) => ({
      categoryName: (c.categoryName as string) ?? "—",
      count: toNum(c.count),
    })),
    topTypes: ((inc.topTypes as Array<Record<string, unknown>> | undefined) ?? []).map((t) => ({
      typeName: (t.typeName as string) ?? "—",
      count: toNum(t.count),
    })),
    topDepartments: ((inc.topDepartments as Array<Record<string, unknown>> | undefined) ?? []).map((d) => ({
      departmentName: (d.departmentName as string) ?? "—",
      count: toNum(d.count),
    })),
  };
}

function mapTimeSeries(raw: Record<string, unknown>): ExportTimeSeriesBucket[] | undefined {
  const buckets = raw.buckets as Array<Record<string, unknown>> | undefined;
  if (!buckets) return undefined;
  return buckets.map((b) => {
    const i = (b.incidents as Record<string, unknown> | undefined) ?? {};
    return {
      bucketStart: (b.bucketStart as string) ?? "",
      total: toNum(i.total),
      done: toNum(i.done),
      highCritical: toNum(i.highCritical),
      patientSource: toNum(i.patientSource),
    };
  });
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "нет данных";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}% к пред. периоду`;
}

function formatDateShort(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} мин`;
  if (h < 24) return `${h.toFixed(1)} ч`;
  return `${(h / 24).toFixed(1)} дн`;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const sq = arr.map((v) => (v - m) ** 2);
  return Math.sqrt(mean(sq));
}

export function ReportsView() {
  const { data: session } = useSession();
  const sessionUserName = (session?.user as { name?: string } | undefined)?.name;
  const { orgId, isResolving: isOrgResolving } = useActiveOrgId();
  useRequirePermission("canViewReports");
  const allCapa = useCapaStore((s) => s.entries);
  const capaEntries = useMemo(
    () => allCapa.filter((e) => e.organizationId === orgId),
    [allCapa, orgId],
  );
  // Для шапки экспорта. Имена категорий/типов приходят строками в snapshot.
  const { employee } = useMyEmployee();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodValue>("30d");
  const [forecastMethod, setForecastMethod] = useState<"holt" | "lstm">("holt");
  const [forecastCategory, setForecastCategory] = useState<string>("all");
  const [lstmResult, setLstmResult] = useState<{
    key: string;
    requests: ForecastResult;
    events: ForecastResult;
  } | null>(null);
  const [isTrainingLstm, setIsTrainingLstm] = useState(false);

  const defaultCustomRange: DateRange = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 13);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }, []);

  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    defaultCustomRange,
  );

  const [seedData, setSeedData] = useState<{ events: any[], requests: any[] }>({ events: [], requests: [] });

  useEffect(() => {
    if (isOrgResolving) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const userId = (session?.user as any)?.id;
        if (!userId) return;

        if (orgId) {
          // Бэк требует RFC3339. Грузим двойное окно для сравнения с пред. периодом.
          const now = Date.now();
          let fromMs: number;
          let toMs: number = now;
          if (period === "custom") {
            const cf = customRange?.from?.getTime();
            const ct = customRange?.to?.getTime() ?? customRange?.from?.getTime() ?? now;
            if (cf == null) {
              fromMs = now - 30 * DAY_MS;
            } else {
              const len = Math.max(ct - cf, DAY_MS);
              fromMs = cf - len;
              toMs = ct;
            }
          } else if (period === "all") {
            fromMs = now - 5 * 365 * DAY_MS;
          } else {
            const cfg = PERIODS.find((p) => p.value === period)!;
            fromMs = now - 2 * cfg.days * DAY_MS;
          }
          const from = new Date(fromMs).toISOString();
          const to = new Date(toMs).toISOString();
          const snapshotRes = await AnalyticsQueryService.analyticsQueryGetSnapshot(orgId, from, to);
          if (snapshotRes && !("code" in snapshotRes)) {
            const snap = snapshotRes as any;
            const mappedEvents = (snap.incidents || []).map((i: any) => ({
              ...i,
              status: (i.status || "").toLowerCase().replace("incident_status_", ""),
              priority: (i.priority || "").toLowerCase().replace("incident_priority_", ""),
            }));

            const mappedRequests = (snap.requests || []).map((r: any) => ({
              ...r,
              status: (r.status || "").toLowerCase().replace("service_request_status_", ""),
              priority: "low",
              responsibleDept: r.departmentId || "Не указана",
            }));

            setSeedData({ events: mappedEvents, requests: mappedRequests });
          }
        }
      } catch (err) {
        console.error("Failed to load analytics snapshot", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    // DateRange меняет ссылку каждый рендер, поэтому deps по getTime().
  }, [
    session,
    orgId,
    isOrgResolving,
    period,
    customRange?.from?.getTime(),
    customRange?.to?.getTime(),
  ]);

  const { startMs, endMs, prevStartMs, prevEndMs, effectiveDays } = useMemo(() => {
    // Date.now() здесь безопасен: useMemo пересчитывается только при смене
    // period/customRange, и в этот момент нам нужен именно текущий timestamp.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();

    if (period === "custom") {
      const from = customRange?.from?.getTime() ?? now - 14 * DAY_MS;
      const rawTo = customRange?.to?.getTime() ?? customRange?.from?.getTime() ?? now;
      const to = rawTo + DAY_MS - 1;

      const safeFrom = Math.min(from, to);
      const safeTo = Math.max(from, to);
      const lengthMs = safeTo - safeFrom + 1;

      return {
        startMs: safeFrom,
        endMs: safeTo,
        prevStartMs: safeFrom - lengthMs,
        prevEndMs: safeFrom - 1,
        effectiveDays: Math.max(1, Math.ceil(lengthMs / DAY_MS)),
      };
    }

    const cfg = PERIODS.find((p) => p.value === period)!;
    if (period === "all") {
      const earliest = seedData.events
        .concat(seedData.requests)
        .reduce(
          (min: number, it: any) => Math.min(min, new Date(it.createdAt).getTime()),
          now,
        );
      return {
        startMs: earliest,
        endMs: now,
        prevStartMs: 0,
        prevEndMs: earliest - 1,
        effectiveDays: Math.max(1, Math.ceil((now - earliest) / DAY_MS)),
      };
    }

    const start = now - cfg.days * DAY_MS;
    return {
      startMs: start,
      endMs: now,
      prevStartMs: start - cfg.days * DAY_MS,
      prevEndMs: start - 1,
      effectiveDays: cfg.days,
    };
  }, [period, customRange, seedData]);

  const filtered = useMemo(() => {
    const within = <T extends { createdAt: string }>(
      items: T[],
      from: number,
      to: number,
    ) =>
      items.filter((it) => {
        const t = new Date(it.createdAt).getTime();
        return t >= from && t <= to;
      });

    return {
      events: within(seedData.events, startMs, endMs),
      requests: within(seedData.requests, startMs, endMs),
      prevEvents: within(seedData.events, prevStartMs, prevEndMs),
      prevRequests: within(seedData.requests, prevStartMs, prevEndMs),
    };
  }, [seedData, startMs, endMs, prevStartMs, prevEndMs]);

  const exportPayload = useMemo<ExportPayload>(() => {
    const events = filtered.events;
    const periodLabel =
      PERIODS.find((p) => p.value === period)?.label ?? "Период";
    const generatedBy =
      employee?.displayName ||
      [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
      sessionUserName ||
      "—";

    return {
      organization: employee?.organizationName || "—",
      periodLabel,
      fromIso: new Date(startMs).toISOString(),
      toIso: new Date(endMs).toISOString(),
      generatedAtIso: new Date().toISOString(),
      generatedBy,
      events: events.map((e: {
        createdAt?: string;
        occurredAt?: string;
        closedAt?: string;
        status?: string;
        priority?: string;
        categoryName?: string;
        typeName?: string;
        clinicId?: string;
        departmentId?: string;
        isPatientSource?: boolean;
        isReopened?: boolean;
        linkedRequestsCount?: number;
      }) => ({
        createdAt: e.createdAt,
        occurredAt: e.occurredAt,
        closedAt: e.closedAt,
        status: e.status,
        priority: e.priority,
        categoryName: e.categoryName,
        typeName: e.typeName,
        clinicId: e.clinicId,
        departmentId: e.departmentId,
        isPatientSource: e.isPatientSource,
        isReopened: e.isReopened,
        linkedRequestsCount: e.linkedRequestsCount,
      })),
    };
  }, [filtered.events, period, startMs, endMs, employee, sessionUserName]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // На длинных окнах укрупняем бакеты, иначе график выродится в каркас.
      let granularity:
        | "TIME_SERIES_GRANULARITY_DAY"
        | "TIME_SERIES_GRANULARITY_WEEK"
        | "TIME_SERIES_GRANULARITY_MONTH" = "TIME_SERIES_GRANULARITY_DAY";
      const lengthDays = Math.max(1, Math.ceil((endMs - startMs) / DAY_MS));
      if (lengthDays > 365) granularity = "TIME_SERIES_GRANULARITY_MONTH";
      else if (lengthDays > 60) granularity = "TIME_SERIES_GRANULARITY_WEEK";

      const fromIso = new Date(startMs).toISOString();
      const toIso = new Date(endMs).toISOString();

      const [summaryRes, tsRes] = orgId
        ? await Promise.allSettled([
            AnalyticsQueryService.analyticsQueryGetSummary(orgId, fromIso, toIso),
            AnalyticsQueryService.analyticsQueryGetTimeSeries(
              orgId,
              fromIso,
              toIso,
              undefined,
              undefined,
              granularity,
            ),
          ])
        : [];

      const summary =
        summaryRes && summaryRes.status === "fulfilled" && summaryRes.value && !("code" in summaryRes.value)
          ? mapSummary(summaryRes.value as Record<string, unknown>)
          : undefined;

      const timeseries =
        tsRes && tsRes.status === "fulfilled" && tsRes.value && !("code" in tsRes.value)
          ? mapTimeSeries(tsRes.value as Record<string, unknown>)
          : undefined;

      await exportPdf(
        { ...exportPayload, summary, timeseries },
        "journal-ns-medincident",
      );
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const kpi = useMemo(() => {
    const { events, requests, prevEvents, prevRequests } = filtered;

    const activeReq = requests.filter((r) =>
      ACTIVE_REQUEST_STATUSES.includes(r.status),
    ).length;
    const activeEvt = events.filter((e) =>
      ACTIVE_EVENT_STATUSES.includes(e.status),
    ).length;

    const completedReq = requests.filter((r) => r.status === "completed");
    const withDuration = completedReq
      .filter((r) => r.completedAt)
      .map(
        (r) =>
          (new Date(r.completedAt!).getTime() -
            new Date(r.createdAt).getTime()) /
          3_600_000,
      );
    const avgCompletionH =
      withDuration.length > 0
        ? withDuration.reduce((a, b) => a + b, 0) / withDuration.length
        : 0;

    // isReopened=true приходит из :reopen-команды бэка.
    const reopenedEvt = events.filter((e: any) => e.isReopened === true).length;
    const prevReopenedEvt = prevEvents.filter((e: any) => e.isReopened === true).length;

    return {
      totalRequests: requests.length,
      deltaRequests: pctChange(requests.length, prevRequests.length),
      totalEvents: events.length,
      deltaEvents: pctChange(events.length, prevEvents.length),
      activeRequests: activeReq,
      activeEvents: activeEvt,
      completedRequests: completedReq.length,
      avgCompletionH,
      reopenedEvents: reopenedEvt,
      deltaReopened: pctChange(reopenedEvt, prevReopenedEvt),
    };
  }, [filtered]);

  const frequencyData = useMemo(() => {
    const useWeekly = effectiveDays > 60;
    const bucketSizeDays = useWeekly ? 7 : 1;
    const bucketSizeMs = bucketSizeDays * DAY_MS;
    const numBuckets = Math.max(1, Math.ceil((endMs - startMs) / bucketSizeMs));

    const buckets: Array<{
      name: string;
      Заявки: number;
      Инциденты: number;
      bucketEndMs: number;
    }> = [];

    for (let i = numBuckets - 1; i >= 0; i--) {
      const bucketEnd = endMs - i * bucketSizeMs;
      const bucketStart = bucketEnd - bucketSizeMs;

      const reqs = filtered.requests.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= bucketStart && t < bucketEnd;
      }).length;

      const evts = filtered.events.filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return t >= bucketStart && t < bucketEnd;
      }).length;

      buckets.push({
        name: formatDateShort(new Date(bucketEnd)),
        Заявки: reqs,
        Инциденты: evts,
        bucketEndMs: bucketEnd,
      });
    }

    return { buckets, useWeekly, bucketSizeMs };
  }, [filtered, startMs, endMs, effectiveDays]);

  // Категории НС, доступные для фильтра прогноза (из событий периода + те,
  // по которым заведены CAPA — чтобы линию мероприятия было к чему привязать).
  const forecastCategoryOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const e of filtered.events as Array<{ categoryId?: string; categoryName?: string }>) {
      if (e.categoryId) byId.set(e.categoryId, e.categoryName || e.categoryId);
    }
    for (const c of capaEntries) {
      if (c.categoryId && !byId.has(c.categoryId)) byId.set(c.categoryId, c.categoryName);
    }
    return Array.from(byId, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [filtered.events, capaEntries]);

  // Частота для карточки прогноза: при выбранной категории «Инциденты»
  // считаются только по ней — иначе эффект CAPA тонет в общей сумме.
  // Аномалии и KPI-плитки продолжают считаться по всем категориям (frequencyData).
  const forecastFrequency = useMemo(() => {
    if (forecastCategory === "all") return frequencyData;
    const evts = (filtered.events as Array<{ createdAt: string; categoryId?: string }>).filter(
      (e) => e.categoryId === forecastCategory,
    );
    const buckets = frequencyData.buckets.map((b) => {
      const start = b.bucketEndMs - frequencyData.bucketSizeMs;
      const count = evts.filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return t >= start && t < b.bucketEndMs;
      }).length;
      return { ...b, Инциденты: count };
    });
    return { ...frequencyData, buckets };
  }, [forecastCategory, frequencyData, filtered.events]);

  // Аномалии: бакет, где значение отклоняется от среднего более чем на ANOMALY_Z_THRESHOLD σ.
  const anomalies = useMemo(() => {
    const reqs = frequencyData.buckets.map((b) => b["Заявки"]);
    const evts = frequencyData.buckets.map((b) => b["Инциденты"]);
    const reqMean = mean(reqs);
    const reqStd = stdDev(reqs);
    const evtMean = mean(evts);
    const evtStd = stdDev(evts);

    type AnomalyRow = {
      bucket: string;
      bucketEndMs: number;
      metric: "Заявки" | "Инциденты";
      value: number;
      baseline: number;
      z: number;
      direction: "up" | "down";
    };

    const rows: AnomalyRow[] = [];

    frequencyData.buckets.forEach((b) => {
      if (reqStd > 0) {
        const z = (b["Заявки"] - reqMean) / reqStd;
        if (Math.abs(z) > ANOMALY_Z_THRESHOLD) {
          rows.push({
            bucket: b.name,
            bucketEndMs: b.bucketEndMs,
            metric: "Заявки",
            value: b["Заявки"],
            baseline: reqMean,
            z,
            direction: z > 0 ? "up" : "down",
          });
        }
      }
      if (evtStd > 0) {
        const z = (b["Инциденты"] - evtMean) / evtStd;
        if (Math.abs(z) > ANOMALY_Z_THRESHOLD) {
          rows.push({
            bucket: b.name,
            bucketEndMs: b.bucketEndMs,
            metric: "Инциденты",
            value: b["Инциденты"],
            baseline: evtMean,
            z,
            direction: z > 0 ? "up" : "down",
          });
        }
      }
    });

    rows.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));

    return {
      rows,
      reqMean,
      evtMean,
      bucketUnitAcc: frequencyData.useWeekly ? "неделю" : "день",
      bucketUnitShort: frequencyData.useWeekly ? "нед." : "дн.",
      bucketCount: frequencyData.buckets.length,
    };
  }, [frequencyData]);

  const changePoints = useMemo(() => {
    const labels = forecastFrequency.buckets.map(b => b.name);
    const reqVals = forecastFrequency.buckets.map(b => b["Заявки"]);
    const evtVals = forecastFrequency.buckets.map(b => b["Инциденты"]);

    return {
      requests: detectChangePoints(reqVals, labels),
      events: detectChangePoints(evtVals, labels),
    };
  }, [forecastFrequency]);

  // Маркеры CAPA: только когда выбрана конкретная категория — на «Все
  // категории» они без контекста и зашумляют общий график.
  // Сравнение по локальной дате (YYYY-MM-DD), а не таймстампам — иначе
  // CAPA с `introducedAt: "YYYY-MM-DD"` (парсится как UTC 00:00) уезжает
  // на день в часовых поясах + и не попадает ни в один локальный бакет.
  // Учитываем и прогнозную часть графика (4 недели / 7 дней вперёд):
  // если дата CAPA лежит в прогнозной зоне — мапим на прогнозный тик.
  const capaMarkers = useMemo(() => {
    if (forecastCategory === "all") return [];

    const ymd = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    const size = forecastFrequency.bucketSizeMs;
    const histBuckets = forecastFrequency.buckets;
    const allTicks: Array<{ name: string; startYmd: string; endYmd: string }> = [];
    histBuckets.forEach((b) => {
      const start = new Date(b.bucketEndMs - size);
      const end = new Date(b.bucketEndMs - 1);
      allTicks.push({ name: b.name, startYmd: ymd(start), endYmd: ymd(end) });
    });
    if (histBuckets.length > 0) {
      const horizon = forecastFrequency.useWeekly ? 4 : 7;
      const lastMs = histBuckets[histBuckets.length - 1].bucketEndMs;
      for (let h = 0; h < horizon; h++) {
        const endMs = lastMs + (h + 1) * size;
        const start = new Date(endMs - size);
        const end = new Date(endMs - 1);
        allTicks.push({
          name: formatDateShort(new Date(endMs)),
          startYmd: ymd(start),
          endYmd: ymd(end),
        });
      }
    }

    return capaEntries
      .filter((c) => c.categoryId === forecastCategory)
      .map((c) => {
        const capaYmd = String(c.introducedAt).slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(capaYmd)) return null;
        const tick = allTicks.find(
          (t) => capaYmd >= t.startYmd && capaYmd <= t.endYmd,
        );
        if (!tick) return null;
        const short = c.title.length > 22 ? c.title.slice(0, 21) + "…" : c.title;
        return { name: tick.name, color: "#10b981", label: `КАПА: ${short}` };
      })
      .filter((m): m is { name: string; color: string; label: string } => m !== null);
  }, [capaEntries, forecastCategory, forecastFrequency]);

  const forecastSeriesKey = useMemo(() => {
    // Ключ для кеша LSTM — меняется только при изменении рядов.
    return (
      forecastCategory + ":" + forecastFrequency.useWeekly + ":" +
      forecastFrequency.buckets
        .map(b => `${b["Заявки"]}|${b["Инциденты"]}`)
        .join(",")
    );
  }, [forecastCategory, forecastFrequency]);

  useEffect(() => {
    if (forecastMethod !== "lstm") return;
    if (forecastFrequency.buckets.length < 7) return;
    if (lstmResult?.key === forecastSeriesKey) return;

    let cancelled = false;
    setIsTrainingLstm(true);

    (async () => {
      const { forecastLstm } = await import("@/lib/analytics/lstm-forecast");
      const horizon = forecastFrequency.useWeekly ? 4 : 7;
      const reqSeries = forecastFrequency.buckets.map(b => b["Заявки"]);
      const evtSeries = forecastFrequency.buckets.map(b => b["Инциденты"]);

      try {
        const [reqRes, evtRes] = await Promise.all([
          forecastLstm(reqSeries, horizon),
          forecastLstm(evtSeries, horizon),
        ]);
        if (!cancelled) {
          setLstmResult({ key: forecastSeriesKey, requests: reqRes, events: evtRes });
        }
      } catch (e) {
        console.error("LSTM training failed", e);
      } finally {
        if (!cancelled) setIsTrainingLstm(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [forecastMethod, forecastSeriesKey, forecastFrequency, lstmResult]);

  const forecast = useMemo(() => {
    const horizon = forecastFrequency.useWeekly ? 4 : 7;
    const reqSeries = forecastFrequency.buckets.map(b => b["Заявки"]);
    const evtSeries = forecastFrequency.buckets.map(b => b["Инциденты"]);

    const holtReq = forecastHolt(reqSeries, horizon);
    const holtEvt = forecastHolt(evtSeries, horizon);

    const useLstm =
      forecastMethod === "lstm" && lstmResult?.key === forecastSeriesKey;
    const reqRes = useLstm ? lstmResult!.requests : holtReq;
    const evtRes = useLstm ? lstmResult!.events : holtEvt;

    const hasEnoughData = forecastFrequency.buckets.length >= 5;

    const chartData: Array<{
      name: string;
      "Заявки"?: number | null;
      "Инциденты"?: number | null;
      "Заявки_прогноз"?: number | null;
      "Инциденты_прогноз"?: number | null;
      "Заявки_ДИ"?: [number, number] | null;
      "Инциденты_ДИ"?: [number, number] | null;
      isForecast?: boolean;
    }> = forecastFrequency.buckets.map((b, i, arr) => {
      const isLast = i === arr.length - 1;
      const base: any = {
        name: b.name,
        "Заявки": b["Заявки"],
        "Инциденты": b["Инциденты"],
      };
      if (isLast && hasEnoughData) {
        base["Заявки_прогноз"] = b["Заявки"];
        base["Инциденты_прогноз"] = b["Инциденты"];
        base["Заявки_ДИ"] = [b["Заявки"], b["Заявки"]];
        base["Инциденты_ДИ"] = [b["Инциденты"], b["Инциденты"]];
      }
      return base;
    });

    const forecastStartName =
      forecastFrequency.buckets.length > 0
        ? forecastFrequency.buckets[forecastFrequency.buckets.length - 1].name
        : undefined;

    if (hasEnoughData) {
      const lastMs =
        forecastFrequency.buckets[forecastFrequency.buckets.length - 1].bucketEndMs;
      for (let h = 0; h < horizon; h++) {
        const endMs = lastMs + (h + 1) * forecastFrequency.bucketSizeMs;
        const rp = reqRes.points[h];
        const ep = evtRes.points[h];
        chartData.push({
          name: formatDateShort(new Date(endMs)),
          "Заявки": null,
          "Инциденты": null,
          "Заявки_прогноз": rp.mean,
          "Инциденты_прогноз": ep.mean,
          "Заявки_ДИ": [rp.lower, rp.upper],
          "Инциденты_ДИ": [ep.lower, ep.upper],
          isForecast: true,
        });
      }
    }

    return {
      requests: reqRes,
      events: evtRes,
      horizon,
      unit: forecastFrequency.useWeekly ? "неделю" : "день",
      unitPlural: forecastFrequency.useWeekly ? "недель" : "дней",
      hasEnoughData,
      chartData,
      forecastStartName,
      activeMethod: useLstm ? ("lstm" as const) : ("holt" as const),
    };
  }, [forecastFrequency, forecastMethod, forecastSeriesKey, lstmResult]);

  const distributions = useMemo(() => {
    const byReqStatus = Object.entries(
      filtered.requests.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([status, value]) => ({
      name: STATUS_MAP[status] ?? status,
      value,
    }));

    const byDept = Object.entries(
      filtered.requests.reduce<Record<string, number>>((acc, r) => {
        const key = r.responsibleDept || "—";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byPriority = Object.entries(
      filtered.requests.reduce<Record<string, number>>((acc, r) => {
        acc[r.priority] = (acc[r.priority] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([p, value]) => ({
      name: PRIORITY_MAP[p as Priority] ?? p,
      value,
    }));

    const byEventCat = Object.entries(
      filtered.events.reduce<Record<string, number>>((acc, e) => {
        const key = e.categoryName ?? e.categoryId;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byEventStatus = Object.entries(
      filtered.events.reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([s, value]) => ({
      name: EVENT_STATUS_MAP[s as EventStatus] ?? s,
      value,
    }));

    // Stacked bar по топ-N категориям, остальные в «Прочее».
    const TOP_CATEGORIES_LIMIT = 5;
    const topCategoryNames = byEventCat.slice(0, TOP_CATEGORIES_LIMIT).map((c) => c.name);
    const useWeeklyCat = effectiveDays > 60;
    const bucketSizeCatMs = (useWeeklyCat ? 7 : 1) * DAY_MS;
    const numBucketsCat = Math.max(1, Math.ceil((endMs - startMs) / bucketSizeCatMs));
    const catBuckets: Array<Record<string, any>> = [];
    for (let i = 0; i < numBucketsCat; i++) {
      const bucketStart = startMs + i * bucketSizeCatMs;
      const d = new Date(bucketStart);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const row: Record<string, any> = { name: `${dd}.${mm}` };
      for (const cat of topCategoryNames) row[cat] = 0;
      row["Прочее"] = 0;
      catBuckets.push(row);
    }
    for (const e of filtered.events) {
      const t = new Date(e.createdAt).getTime();
      const idx = Math.floor((t - startMs) / bucketSizeCatMs);
      if (idx < 0 || idx >= numBucketsCat) continue;
      const cat = (e as any).categoryName ?? (e as any).categoryId ?? "Прочее";
      const key = topCategoryNames.includes(cat) ? cat : "Прочее";
      catBuckets[idx][key] = (catBuckets[idx][key] ?? 0) + 1;
    }
    // Убираем «Прочее» из легенды, если по всем бакетам нули.
    const hasOther = catBuckets.some((b) => b["Прочее"] > 0);
    const eventCatSeries = hasOther ? [...topCategoryNames, "Прочее"] : topCategoryNames;
    if (!hasOther) catBuckets.forEach((b) => delete b["Прочее"]);

    return {
      byReqStatus: enrichChartData(byReqStatus),
      byDept,
      byPriority: enrichChartData(byPriority),
      byEventCat,
      byEventStatus: enrichChartData(byEventStatus),
      eventCatTimeline: catBuckets,
      eventCatTimelineSeries: eventCatSeries,
    };
  }, [filtered, startMs, endMs, effectiveDays]);

  const hasAnyData =
    filtered.events.length > 0 || filtered.requests.length > 0;

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5">
            <h1 className="text-2xl font-bold">Отчёты и аналитика</h1>
            {anomalies.rows.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium whitespace-nowrap">
                <Siren className="h-3.5 w-3.5" />
                {anomalies.rows.length}{" "}
                {anomalies.rows.length === 1 ? "аномалия" : "аномалии"}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Сводная статистика работы клиники
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as PeriodValue)}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={isLoading || isExporting || exportPayload.events.length === 0}
            onClick={handleExportPdf}
            variant="outline"
            className="shrink-0 w-10 sm:w-auto px-0 sm:px-4 justify-center"
            title="Журнал НС в PDF (приказ Минздрава № 785н)"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Экспорт (PDF)</span>
          </Button>
        </div>
      </div>

      {period === "custom" && (
        <div className="bg-muted/30 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 max-w-md">
            <DateRangePicker
              value={customRange}
              onChange={setCustomRange}
              toDate={new Date()}
              placeholder="Выберите диапазон"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {customRange?.from && customRange?.to ? (
              <>
                Период:{" "}
                <b className="text-foreground">{effectiveDays}</b>{" "}
                {effectiveDays === 1 ? "день" : "дн."}
              </>
            ) : (
              <span>Выберите начальную и конечную даты</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`kpi-skel-${i}`} className="border rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Всего заявок"
              value={kpi.totalRequests}
              delta={kpi.deltaRequests}
              icon={FileText}
            />
            <KPICard
              title="Активные ремонты"
              value={kpi.activeRequests}
              subtitle={`из ${kpi.totalRequests} за период`}
              icon={Wrench}
              className="bg-info/10 border-info/20 text-info"
              iconColor="text-info"
            />
            <KPICard
              title="Инциденты (НС)"
              value={kpi.totalEvents}
              delta={kpi.deltaEvents}
              icon={AlertTriangle}
              className="bg-warning/10 border-warning/20 text-warning"
              iconColor="text-warning"
            />
            <KPICard
              title="Повторно открытые НС"
              value={kpi.reopenedEvents}
              delta={kpi.deltaReopened}
              subtitle={kpi.totalEvents > 0 ? `${Math.round((kpi.reopenedEvents / kpi.totalEvents) * 100)}% от всех НС` : "—"}
              icon={RotateCcw}
              className="bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
              iconColor="text-purple-600 dark:text-purple-400"
            />
          </>
        )}
      </div>

      <Separator />

      <Tabs defaultValue="frequency" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto min-h-12 p-1 bg-muted rounded-lg md:w-[640px] border">
          <TabsTrigger
            value="frequency"
            className="text-xs sm:text-sm h-full py-2 whitespace-normal leading-tight"
          >
            Частота
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="text-xs sm:text-sm h-full py-2 whitespace-normal leading-tight"
          >
            Заявки
          </TabsTrigger>
          <TabsTrigger
            value="safety"
            className="text-xs sm:text-sm h-full py-2 whitespace-normal leading-tight"
          >
            Инциденты
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="text-xs sm:text-sm h-full py-2 whitespace-normal leading-tight"
          >
            Сводка
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frequency" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Частота регистрации
                  </CardTitle>
                  <CardDescription>
                    {forecastCategory === "all"
                      ? `Заявки и инциденты ${frequencyData.useWeekly ? "по неделям" : "по дням"}.`
                      : `Инциденты категории по дням. Зелёная линия — ввод мероприятия (CAPA), видно динамику до и после.`}
                  </CardDescription>
                </div>
                <Select value={forecastCategory} onValueChange={setForecastCategory}>
                  <SelectTrigger className="w-full sm:w-[240px] bg-background">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">
                        <SelectValue placeholder="Категория НС" />
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border">
                    <SelectItem value="all">Все категории</SelectItem>
                    {forecastCategoryOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full min-h-[360px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : hasAnyData ? (
                  <ForecastChart
                    data={forecast.chartData}
                    forecastStartName={forecast.forecastStartName}
                    height={360}
                    changePoints={[
                      ...(forecastCategory === "all"
                        ? changePoints.requests.map(cp => ({
                            name: cp.bucketName,
                            color: "#f59e0b",
                            label: `${cp.direction === "up" ? "↑" : "↓"} заявки ${
                              cp.deltaPct !== null
                                ? `${cp.deltaPct > 0 ? "+" : ""}${cp.deltaPct.toFixed(0)}%`
                                : ""
                            }`,
                          }))
                        : []),
                      ...changePoints.events.map(cp => ({
                        name: cp.bucketName,
                        color: "#3b82f6",
                        label: `${cp.direction === "up" ? "↑" : "↓"} НС ${
                          cp.deltaPct !== null
                            ? `${cp.deltaPct > 0 ? "+" : ""}${cp.deltaPct.toFixed(0)}%`
                            : ""
                        }`,
                      })),
                    ]}
                    capaMarkers={capaMarkers}
                    showRequests={forecastCategory === "all"}
                  />
                ) : (
                  <EmptyState />
                )}
              </div>
              {forecast.hasEnoughData && (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-4 h-0.5 bg-muted-foreground" />
                    история
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block w-4 border-t border-dashed"
                      style={{ borderColor: "currentColor" }}
                    />
                    прогноз
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-4 h-2 bg-muted/50 border border-muted-foreground/30 rounded-[2px]" />
                    95% ДИ
                  </span>
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <FrequencyTile
                  label={`Среднее в ${anomalies.bucketUnitAcc} (заявки)`}
                  value={anomalies.reqMean.toFixed(1)}
                  icon={Wrench}
                  tone="info"
                />
                <FrequencyTile
                  label={`Среднее в ${anomalies.bucketUnitAcc} (НС)`}
                  value={anomalies.evtMean.toFixed(1)}
                  icon={AlertTriangle}
                  tone="warning"
                />
                <FrequencyTile
                  label="Пик (заявки)"
                  value={frequencyData.buckets.reduce(
                    (m, b) => (b["Заявки"] > m ? b["Заявки"] : m),
                    0,
                  )}
                  icon={Activity}
                  tone="info"
                />
                <FrequencyTile
                  label="Пик (НС)"
                  value={frequencyData.buckets.reduce(
                    (m, b) => (b["Инциденты"] > m ? b["Инциденты"] : m),
                    0,
                  )}
                  icon={Activity}
                  tone="warning"
                />
              </div>
            </CardContent>
          </Card>

          <ForecastCard
            forecast={forecast}
            isLoading={isLoading}
            method={forecastMethod}
            onMethodChange={setForecastMethod}
            isTrainingLstm={isTrainingLstm}
            hasLstmResult={lstmResult?.key === forecastSeriesKey}
          />

          <ChangePointCard
            requestPoints={changePoints.requests}
            eventPoints={changePoints.events}
            isLoading={isLoading}
          />

          <Card className={cn(anomalies.rows.length > 0 && "border-destructive/30")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Siren
                  className={cn(
                    "h-5 w-5",
                    anomalies.rows.length > 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                />
                Аномалии
              </CardTitle>
              <CardDescription>
                Отдельные дни (или недели), в которые регистраций было заметно
                больше или меньше обычного. Такие скачки выбиваются из привычной
                картины и стоят того, чтобы в них разобраться — возможно, была
                авария, массовое ЧП или нерабочий день.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : anomalies.rows.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20 text-success">
                  <div className="shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Всё в пределах нормы
                    </p>
                    <p className="text-xs opacity-80">
                      За выбранный период подозрительных всплесков или провалов
                      не зафиксировано.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {anomalies.rows.slice(0, 8).map((a, idx) => (
                    <AnomalyRow key={`${a.bucket}-${a.metric}-${idx}`} row={a} />
                  ))}
                  {anomalies.rows.length > 8 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      …и ещё {anomalies.rows.length - 8} корзин(ы)
                    </p>
                  )}
                </ul>
              )}

              {anomalies.bucketCount > 0 && (
                <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                  Считаем по {anomalies.bucketCount} {anomalies.bucketUnitShort}{" "}
                  выбранного периода. Типичное среднее:{" "}
                  <b className="text-foreground">
                    {anomalies.reqMean.toFixed(1)}
                  </b>{" "}
                  заявок и{" "}
                  <b className="text-foreground">
                    {anomalies.evtMean.toFixed(1)}
                  </b>{" "}
                  инцидентов в {anomalies.bucketUnitAcc}.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Статусы заявок</CardTitle>
                <CardDescription>
                  Распределение заявок по этапам выполнения
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : distributions.byReqStatus.length > 0 ? (
                  <DynamicChart
                    type="bar-vertical"
                    data={distributions.byReqStatus}
                    height={300}
                    color="hsl(var(--primary))"
                  />
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Нагрузка на службы</CardTitle>
                <CardDescription>
                  Топ-8 отделов по количеству заявок
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : distributions.byDept.length > 0 ? (
                  <DynamicChart
                    type="bar-horizontal"
                    data={distributions.byDept}
                    height={300}
                    color="hsl(var(--info))"
                  />
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Приоритеты заявок</CardTitle>
                <CardDescription>
                  Структура потока по срочности.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : distributions.byPriority.length > 0 ? (
                  <DynamicChart
                    type="donut"
                    data={distributions.byPriority}
                    height={300}
                  />
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Статусы инцидентов</CardTitle>
                <CardDescription>
                  Распределение НС по стадиям обработки
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : distributions.byEventStatus.length > 0 ? (
                  <DynamicChart
                    type="pie"
                    data={distributions.byEventStatus}
                    height={300}
                  />
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Типы инцидентов</CardTitle>
                <CardDescription>Частота по категориям НС (топ-8)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : distributions.byEventCat.length > 0 ? (
                  <DynamicChart
                    type="bar-horizontal"
                    data={distributions.byEventCat}
                    height={300}
                    color="hsl(var(--warning))"
                  />
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                Динамика НС по категориям
              </CardTitle>
              <CardDescription>
                Количество событий {effectiveDays > 60 ? "по неделям" : "по дням"} с разбивкой по топ-5 категориям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : distributions.eventCatTimelineSeries.length > 0 && filtered.events.length > 0 ? (
                  <DynamicChart
                    type="bar-vertical"
                    data={distributions.eventCatTimeline}
                    dataKey={distributions.eventCatTimelineSeries}
                    height={360}
                    stacked
                    color={[
                      "hsl(var(--warning))",
                      "hsl(var(--primary))",
                      "hsl(var(--info))",
                      "hsl(var(--success))",
                      "hsl(var(--purple))",
                      "hsl(var(--muted-foreground))",
                    ]}
                  />
                ) : (
                  <EmptyState />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Операционные метрики
              </CardTitle>
              <CardDescription>
                Ключевые показатели эффективности за выбранный период
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryStat
                  val={kpi.completedRequests}
                  label="Завершённых заявок"
                  className="bg-success/10 text-success border border-success/20"
                  icon={FileText}
                />
                <SummaryStat
                  val={formatHours(kpi.avgCompletionH)}
                  label="Среднее время выполнения"
                  className="bg-info/10 text-info border border-info/20"
                  icon={Clock}
                />
                <SummaryStat
                  val={distributions.byDept[0]?.name ?? "—"}
                  label="Самый загруженный отдел"
                  className="bg-purple/10 text-purple border border-purple/20"
                  icon={Users}
                />
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground leading-relaxed">
                Данные рассчитаны из{" "}
                <span className="font-semibold text-foreground">
                  {filtered.requests.length}
                </span>{" "}
                заявок и{" "}
                <span className="font-semibold text-foreground">
                  {filtered.events.length}
                </span>{" "}
                инцидентов за выбранный период. Для сравнения с предыдущим
                периодом использованы{" "}
                <span className="font-semibold text-foreground">
                  {filtered.prevRequests.length}
                </span>{" "}
                заявок и{" "}
                <span className="font-semibold text-foreground">
                  {filtered.prevEvents.length}
                </span>{" "}
                инцидентов.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({
  title,
  value,
  delta,
  subtitle,
  icon: Icon,
  className,
  iconColor,
}: {
  title: string;
  value: number | string;
  delta?: number | null;
  subtitle?: string;
  icon: any;
  className?: string;
  iconColor?: string;
}) {
  const hasDelta = typeof delta === "number" || delta === null;

  return (
    <Card
      className={cn(
        "border rounded-xl overflow-hidden transition-colors",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium line-clamp-1">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hasDelta ? (
          <DeltaRow delta={delta} />
        ) : (
          <p className="text-xs text-muted-foreground opacity-80">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DeltaRow({ delta }: { delta: number | null | undefined }) {
  if (delta === null || delta === undefined) {
    return (
      <p className="text-xs text-muted-foreground opacity-80">
        Нет данных за пред. период
      </p>
    );
  }
  const isUp = delta > 0.05;
  const isDown = delta < -0.05;
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const tone = isUp
    ? "text-success"
    : isDown
      ? "text-destructive"
      : "text-muted-foreground";
  return (
    <p className={cn("text-xs flex items-center gap-1 mt-0.5", tone)}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{formatDelta(delta)}</span>
    </p>
  );
}

function FrequencyTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: any;
  tone: "info" | "warning";
}) {
  const toneCls =
    tone === "info"
      ? "bg-info/10 text-info border-info/20"
      : "bg-warning/10 text-warning border-warning/20";
  return (
    <div className={cn("p-4 rounded-xl border flex items-center gap-3", toneCls)}>
      <div className="p-2 bg-background/60 rounded-lg shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[11px] mt-1 opacity-80 line-clamp-2">{label}</p>
      </div>
    </div>
  );
}

function AnomalyRow({
  row,
}: {
  row: {
    bucket: string;
    metric: "Заявки" | "Инциденты";
    value: number;
    baseline: number;
    z: number;
    direction: "up" | "down";
  };
}) {
  const isUp = row.direction === "up";
  const deltaPct =
    row.baseline === 0 ? 0 : ((row.value - row.baseline) / row.baseline) * 100;
  const tone = isUp
    ? "bg-destructive/10 border-destructive/20 text-destructive"
    : "bg-info/10 border-info/20 text-info";
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const directionLabel = isUp
    ? row.metric === "Заявки"
      ? "всплеск заявок"
      : "всплеск инцидентов"
    : row.metric === "Заявки"
      ? "провал заявок"
      : "провал инцидентов";

  return (
    <li className={cn("flex items-center gap-3 p-3 rounded-lg border", tone)}>
      <div className="p-2 rounded-lg bg-background/60 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold capitalize">
            {directionLabel}
          </span>
          <span className="text-xs opacity-70">· {row.bucket}</span>
        </div>
        <p className="text-xs opacity-90 mt-0.5">
          Зарегистрировано <b>{row.value}</b> (обычно{" "}
          {row.baseline.toFixed(1)}, это на{" "}
          <b>
            {deltaPct > 0 ? "+" : ""}
            {deltaPct.toFixed(0)}%
          </b>{" "}
          от нормы)
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold leading-none">
          {row.z > 0 ? "+" : ""}
          {row.z.toFixed(1)}σ
        </p>
        <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
          отклонение
        </p>
      </div>
    </li>
  );
}

function SummaryStat({ val, label, className, icon: Icon }: any) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl flex flex-col items-center justify-center text-center min-h-[140px]",
        className,
      )}
    >
      {Icon && <Icon className="h-5 w-5 mb-2 opacity-70 shrink-0" />}
      <div className="text-xl sm:text-2xl font-bold leading-tight break-words line-clamp-3 max-w-full">
        {val}
      </div>
      <div className="text-[10px] uppercase font-bold mt-2 tracking-wider opacity-80">
        {label}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl bg-muted/10 text-sm text-muted-foreground">
      Нет данных за выбранный период
    </div>
  );
}

function ChangePointCard({
  requestPoints,
  eventPoints,
  isLoading,
}: {
  requestPoints: ChangePoint[];
  eventPoints: ChangePoint[];
  isLoading: boolean;
}) {
  const all = [
    ...requestPoints.map(p => ({ ...p, metric: "Заявки" as const })),
    ...eventPoints.map(p => ({ ...p, metric: "Инциденты" as const })),
  ].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Точки смены режима
          <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground bg-background border rounded-full px-2 py-0.5 ml-1">
            CUSUM
          </span>
        </CardTitle>
        <CardDescription>
          Даты, после которых нагрузка стала заметно отличаться от привычной.
          Если в какой-то день произошёл перелом — авария, приказ, массовое
          ЧП — система автоматически это поймает и покажет здесь. Число «|t|»
          — насколько сильно режим изменился: чем больше, тем увереннее сдвиг
          реальный, а не случайный скачок.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : all.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20 text-success">
            <div className="shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Режим стабилен</p>
              <p className="text-xs opacity-80">
                За период не обнаружено значимых сдвигов уровня регистрации.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {all.map((cp, i) => (
              <ChangePointRow key={`${cp.metric}-${cp.index}-${i}`} cp={cp} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ChangePointRow({
  cp,
}: {
  cp: ChangePoint & { metric: "Заявки" | "Инциденты" };
}) {
  const isUp = cp.direction === "up";
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const tone = isUp
    ? "bg-warning/10 border-warning/20 text-warning"
    : "bg-info/10 border-info/20 text-info";

  return (
    <li className={cn("flex items-center gap-3 p-3 rounded-lg border", tone)}>
      <div className="p-2 rounded-lg bg-background/60 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">
            {cp.metric}:{" "}
            {isUp ? "рост нагрузки" : "спад нагрузки"}
          </span>
          <span className="text-xs opacity-70">· с {cp.bucketName}</span>
        </div>
        <p className="text-xs opacity-90 mt-0.5">
          Среднее: <b>{cp.leftMean.toFixed(1)}</b> →{" "}
          <b>{cp.rightMean.toFixed(1)}</b>
          {cp.deltaPct !== null && (
            <>
              {" "}
              (<b>
                {cp.deltaPct > 0 ? "+" : ""}
                {cp.deltaPct.toFixed(0)}%
              </b>)
            </>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold leading-none">
          |t| {cp.score.toFixed(1)}
        </p>
        <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">
          сила сдвига
        </p>
      </div>
    </li>
  );
}

function ForecastMethodToggle({
  method,
  onChange,
  isTraining,
  disabled,
}: {
  method: "holt" | "lstm";
  onChange: (m: "holt" | "lstm") => void;
  isTraining: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-background p-0.5 shrink-0">
      <button
        type="button"
        onClick={() => onChange("holt")}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
          method === "holt"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Holt
      </button>
      <button
        type="button"
        onClick={() => onChange("lstm")}
        disabled={disabled}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
          method === "lstm"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        title={disabled ? "Нужно минимум 5 точек истории" : undefined}
      >
        {isTraining ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Brain className="h-3 w-3" />
        )}
        LSTM
      </button>
    </div>
  );
}

function ForecastCard({
  forecast,
  isLoading,
  method,
  onMethodChange,
  isTrainingLstm,
  hasLstmResult,
}: {
  forecast: {
    requests: ForecastResult;
    events: ForecastResult;
    horizon: number;
    unit: string;
    unitPlural: string;
    hasEnoughData: boolean;
    activeMethod: "holt" | "lstm";
  };
  isLoading: boolean;
  method: "holt" | "lstm";
  onMethodChange: (m: "holt" | "lstm") => void;
  isTrainingLstm: boolean;
  hasLstmResult: boolean;
}) {
  const methodLabel =
    forecast.activeMethod === "lstm"
      ? "нейросеть, которая учится на ваших данных (LSTM)"
      : "классический алгоритм по тренду (Holt)";

  return (
    <Card className="border-primary/20 bg-primary/5 relative">
      {forecast.hasEnoughData && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <ForecastMethodToggle
            method={method}
            onChange={onMethodChange}
            isTraining={isTrainingLstm}
            disabled={!forecast.hasEnoughData}
          />
        </div>
      )}
      <CardHeader className="pr-32 sm:pr-40">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Прогноз нагрузки
          <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground bg-background border rounded-full px-2 py-0.5 ml-1">
            ML
          </span>
        </CardTitle>
        <CardDescription className="mt-1">
          Сколько регистраций ожидать в ближайшие {forecast.horizon}{" "}
          {forecast.unitPlural}. Система смотрит на недавнюю динамику и
          продолжает её в будущее, показывая наиболее вероятный диапазон.
          Метод: {methodLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {method === "lstm" && !isTrainingLstm && !hasLstmResult && forecast.hasEnoughData && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-background/50 border rounded-md px-3 py-2">
            <Brain className="h-3.5 w-3.5" />
            LSTM пока обучается в фоне, показан Holt-прогноз.
          </div>
        )}
        {method === "lstm" && isTrainingLstm && (
          <div className="flex items-center gap-2 text-[11px] text-primary bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Обучение нейросети… (обычно ≈ 1–3 с)
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ) : !forecast.hasEnoughData ? (
          <p className="text-sm text-muted-foreground">
            Недостаточно данных для прогноза — нужно минимум 5{" "}
            {forecast.unitPlural} истории.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForecastTile
              title="Заявки"
              icon={Wrench}
              tone="info"
              unit={forecast.unit}
              horizon={forecast.horizon}
              unitPlural={forecast.unitPlural}
              result={forecast.requests}
            />
            <ForecastTile
              title="Инциденты (НС)"
              icon={AlertTriangle}
              tone="warning"
              unit={forecast.unit}
              horizon={forecast.horizon}
              unitPlural={forecast.unitPlural}
              result={forecast.events}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ForecastTile({
  title,
  icon: Icon,
  tone,
  unit,
  horizon,
  unitPlural,
  result,
}: {
  title: string;
  icon: any;
  tone: "info" | "warning";
  unit: string;
  horizon: number;
  unitPlural: string;
  result: ForecastResult;
}) {
  const toneCls =
    tone === "info"
      ? "bg-info/10 border-info/20 text-info"
      : "bg-warning/10 border-warning/20 text-warning";

  const avgForecast =
    result.points.reduce((a, p) => a + p.mean, 0) / result.points.length;
  const avgLower =
    result.points.reduce((a, p) => a + p.lower, 0) / result.points.length;
  const avgUpper =
    result.points.reduce((a, p) => a + p.upper, 0) / result.points.length;

  const deltaPct =
    result.historicalMean > 0
      ? ((avgForecast - result.historicalMean) / result.historicalMean) * 100
      : null;

  const direction: "up" | "down" | "flat" =
    deltaPct === null
      ? "flat"
      : deltaPct > 5
        ? "up"
        : deltaPct < -5
          ? "down"
          : "flat";

  const DeltaIcon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : Minus;

  const deltaTone =
    direction === "up"
      ? "text-destructive"
      : direction === "down"
        ? "text-success"
        : "text-muted-foreground";

  const total = result.points.reduce((a, p) => a + p.mean, 0);

  return (
    <div className={cn("p-4 rounded-xl border space-y-3", toneCls)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-background/60 rounded-lg">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {deltaPct !== null && (
          <div className={cn("flex items-center gap-1 text-xs", deltaTone)}>
            <DeltaIcon className="h-3.5 w-3.5" />
            <span className="font-medium">
              {deltaPct > 0 ? "+" : ""}
              {deltaPct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold leading-none text-foreground">
          {avgForecast.toFixed(1)}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            в {unit}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          95% ДИ: {avgLower.toFixed(1)}–{avgUpper.toFixed(1)}
        </p>
      </div>

      <div className="text-xs pt-2 border-t border-current/10 opacity-90">
        За {horizon} {unitPlural} ожидается ≈{" "}
        <b className="text-foreground">{total.toFixed(0)}</b>{" "}
        {title === "Заявки" ? "заявок" : "инцидентов"}.
      </div>
    </div>
  );
}
