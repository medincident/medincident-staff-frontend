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
import { getAnalyticsSeed } from "@/lib/mock-db";
import type { EventStatus, Priority, RequestStatus } from "@/lib/types";

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
  "purchase",
];
const ACTIVE_EVENT_STATUSES: EventStatus[] = [
  "created",
  "in_work",
  "investigation",
  "measures",
];

const DAY_MS = 86_400_000;

// Насколько сильно должно отклониться значение, чтобы мы посчитали день/неделю аномалией.
// 2σ ≈ примерно «такие выбросы случаются примерно в 5% случаев» — всё, что выше,
// стоит того, чтобы на него посмотреть человек.
const ANOMALY_Z_THRESHOLD = 2;

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
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodValue>("30d");

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

  const seedData = useMemo(() => getAnalyticsSeed(), []);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const { startMs, endMs, prevStartMs, prevEndMs, effectiveDays } = useMemo(() => {
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
        .concat(seedData.requests as any)
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

    return {
      totalRequests: requests.length,
      deltaRequests: pctChange(requests.length, prevRequests.length),
      totalEvents: events.length,
      deltaEvents: pctChange(events.length, prevEvents.length),
      activeRequests: activeReq,
      activeEvents: activeEvt,
      completedRequests: completedReq.length,
      avgCompletionH,
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

    return { buckets, useWeekly };
  }, [filtered, startMs, endMs, effectiveDays]);

  // --- АНОМАЛИИ ---
  // Идея простым языком:
  //   1. Смотрим, сколько заявок/НС регистрируется в типичный день (или неделю).
  //   2. Если в какой-то конкретный день пришло ЗАМЕТНО больше или меньше, чем
  //      обычно, — это и есть аномалия. Значит, что-то произошло: авария,
  //      праздник, внешнее ЧП и т.п. — имеет смысл разобраться.
  //   3. «Заметно» — это когда отклонение превышает порог в 2σ (две стандартные
  //      отклонения). Если нагляднее: это такой скачок, который случается сам
  //      по себе примерно в 1 случае из 20 — нормой считать уже нельзя.
  //   4. Метрика «±Nσ» рядом — просто во сколько раз скачок больше обычного
  //      разброса. Чем больше это число, тем ярче всплеск.
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

    return {
      byReqStatus: enrichChartData(byReqStatus),
      byDept,
      byPriority: enrichChartData(byPriority),
      byEventCat,
      byEventStatus: enrichChartData(byEventStatus),
    };
  }, [filtered]);

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
            disabled={isLoading}
            variant="outline"
            className="shrink-0 w-10 sm:w-auto px-0 sm:px-4 justify-center"
          >
            <Download className="h-4 w-4 sm:mr-2" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Частота регистрации
              </CardTitle>
              <CardDescription>
                Количество созданных заявок и инцидентов{" "}
                {frequencyData.useWeekly ? "по неделям" : "по дням"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full min-h-[360px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : hasAnyData ? (
                  <DynamicChart
                    type="area"
                    data={frequencyData.buckets}
                    dataKey={["Заявки", "Инциденты"]}
                    color={["hsl(var(--info))", "hsl(var(--warning))"]}
                    categoryKey="name"
                    height={360}
                  />
                ) : (
                  <EmptyState />
                )}
              </div>

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
                Дни (или недели), в которые нагрузка была заметно выше или ниже
                обычной — статистически такие скачки случаются примерно в 1
                случае из 20. На них стоит обратить внимание: возможно, была
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
        // min-h единый у всех трёх карточек — высота выравнивается по самой
        // «высокой» (с длинным названием отдела), остальные просто центрируют
        // контент в этом боксе.
        "p-4 rounded-xl flex flex-col items-center justify-center text-center min-h-[140px]",
        className,
      )}
    >
      {Icon && <Icon className="h-5 w-5 mb-2 opacity-70 shrink-0" />}
      {/* Длинные названия (например название отдела) теперь переносятся —
          до 3 строк, с break-words чтобы даже монолитная строка без пробелов
          не вылезала за рамки. Чуть меньший шрифт на мобильной, чтобы
          многострочный текст выглядел аккуратнее. */}
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
