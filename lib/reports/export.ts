"use client";

// Экспорт журнала НС в PDF (приказ № 785н).
// pdfmake грузим динамически: ~250 КБ ни к чему в основном бандле.

import { EVENT_STATUS_MAP, INCIDENT_PRIORITY_MAP } from "@/lib/constants";

export interface ExportEvent {
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
}

// Подмножество v1IncidentSummary, чтобы вьюха не перепривязывалась после codegen.
export interface ExportSummary {
  total?: number;
  byStatus?: {
    pending?: number;
    inProgress?: number;
    done?: number;
    rejected?: number;
    cancelled?: number;
  };
  byPriority?: {
    low?: number;
    normal?: number;
    high?: number;
    critical?: number;
  };
  bySource?: {
    staff?: number;
    patient?: number;
  };
  reopened?: number;
  withLinkedRequests?: number;
  resolution?: {
    avgMinutes?: number;
    minMinutes?: number;
    maxMinutes?: number;
    p50Minutes?: number;
    p90Minutes?: number;
    p95Minutes?: number;
  };
  topCategories?: Array<{ categoryName?: string; count?: number }>;
  topTypes?: Array<{ typeName?: string; count?: number }>;
  topDepartments?: Array<{ departmentName?: string; count?: number }>;
}

export interface ExportTimeSeriesBucket {
  bucketStart?: string;
  total?: number;
  done?: number;
  highCritical?: number;
  patientSource?: number;
}

export interface ExportPayload {
  organization: string;
  periodLabel: string;
  fromIso: string;
  toIso: string;
  generatedAtIso: string;
  generatedBy: string;
  events: ExportEvent[];
  // Опциональные агрегаты с бэка — если есть, считаются разделы «Динамика» и «Топ отделений».
  summary?: ExportSummary;
  timeseries?: ExportTimeSeriesBucket[];
}

export async function exportPdf(
  payload: ExportPayload,
  filename = "journal-ns",
): Promise<void> {
  const [{ default: pdfMake }, vfsMod] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  // Поддержка обоих форматов vfs_fonts: 0.2.x (.vfs) и 0.3.x (default).
  const vfsAny = vfsMod as unknown as {
    default?: Record<string, string> | { vfs?: Record<string, string> };
    vfs?: Record<string, string>;
  };
  const vfs: Record<string, string> | undefined =
    (vfsAny.default && "Roboto-Regular.ttf" in vfsAny.default
      ? (vfsAny.default as Record<string, string>)
      : (vfsAny.default as { vfs?: Record<string, string> } | undefined)?.vfs) ??
    vfsAny.vfs;

  if (vfs) {
    const pm = pdfMake as unknown as {
      vfs?: Record<string, string>;
      addVirtualFileSystem?: (v: Record<string, string>) => void;
    };
    if (typeof pm.addVirtualFileSystem === "function") {
      pm.addVirtualFileSystem(vfs);
    } else {
      pm.vfs = vfs;
    }
  }

  pdfMake
    .createPdf(buildDoc(payload) as unknown as Parameters<typeof pdfMake.createPdf>[0])
    .download(withTimestamp(filename, "pdf"));
}

function statusLabel(k?: string): string {
  if (!k) return "—";
  return EVENT_STATUS_MAP[k as keyof typeof EVENT_STATUS_MAP] || k;
}

function priorityLabel(k?: string): string {
  if (!k || k === "unspecified") return "—";
  return INCIDENT_PRIORITY_MAP[k] || k;
}

// pdfmake canvas требует HEX.
const STATUS_COLOR: Record<string, string> = {
  pending: "#94a3b8",
  in_progress: "#f59e0b",
  done: "#10b981",
  rejected: "#ef4444",
  cancelled: "#ef4444",
  unspecified: "#cbd5e1",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "#94a3b8",
  normal: "#3b82f6",
  high: "#f59e0b",
  critical: "#ef4444",
  unspecified: "#cbd5e1",
};

const SOURCE_COLOR: Record<string, string> = {
  staff: "#3b82f6",
  patient: "#8b5cf6",
};

function fmtDate(iso?: string, withTime = false): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return withTime
      ? d.toLocaleString("ru-RU", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : d.toLocaleDateString("ru-RU", {
          day: "2-digit", month: "2-digit", year: "numeric",
        });
  } catch {
    return iso;
  }
}

function fmtDayMonth(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function withTimestamp(base: string, ext: string): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `${base}-${stamp}.${ext}`;
}

function countBy<T>(items: T[], keyFn: (it: T) => string): Array<[string, number]> {
  const m = new Map<string, number>();
  items.forEach((it) => {
    const k = keyFn(it);
    m.set(k, (m.get(k) || 0) + 1);
  });
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

// ResolutionStats приходит в минутах.
function fmtMinutes(min?: number): string {
  if (min == null || !Number.isFinite(min) || min <= 0) return "—";
  if (min < 60) return `${Math.round(min)} мин`;
  const hours = min / 60;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  const days = hours / 24;
  return `${days.toFixed(1)} дн`;
}

const BAR_MAX_W = 220;
function barCell(value: number, max: number, color: string) {
  const w = max > 0 ? Math.max(2, (value / max) * BAR_MAX_W) : 0;
  return {
    canvas: [
      { type: "rect", x: 0, y: 2, w: BAR_MAX_W, h: 8, color: "#eef2f6" },
      { type: "rect", x: 0, y: 2, w, h: 8, color },
    ],
  };
}

function barRow(
  label: string,
  value: number,
  total: number,
  color: string,
) {
  const share = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
  return [
    { text: label, fontSize: 9 },
    barCell(value, total, color),
    { text: `${value} (${share}%)`, fontSize: 9, alignment: "right" },
  ];
}

function buildTimeseriesChart(buckets: ExportTimeSeriesBucket[]) {
  const CHART_W = 760;
  const CHART_H = 140;
  const PAD_L = 28;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 22;
  const innerW = CHART_W - PAD_L - PAD_R;
  const innerH = CHART_H - PAD_T - PAD_B;

  const n = buckets.length;
  if (n === 0) {
    return {
      text: "Нет данных для построения динамики.",
      style: "muted",
      margin: [0, 4, 0, 14] as [number, number, number, number],
    };
  }

  const max = buckets.reduce(
    (m, b) => Math.max(m, b.total ?? 0, b.patientSource ?? 0),
    1,
  );

  const groupW = innerW / n;
  const colW = Math.max(2, Math.min(14, groupW * 0.38));
  const gap = 2;

  type CanvasOp =
    | { type: "rect"; x: number; y: number; w: number; h: number; color?: string }
    | { type: "line"; x1: number; y1: number; x2: number; y2: number; lineWidth?: number; lineColor?: string };

  const canvas: CanvasOp[] = [
    { type: "line", x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: PAD_T + innerH, lineWidth: 0.5, lineColor: "#999" },
    { type: "line", x1: PAD_L, y1: PAD_T + innerH, x2: PAD_L + innerW, y2: PAD_T + innerH, lineWidth: 0.5, lineColor: "#999" },
  ];

  const yTicks: Array<{ y: number; label: string }> = [];
  for (let i = 0; i <= 4; i++) {
    const v = (max * i) / 4;
    const y = PAD_T + innerH - (i / 4) * innerH;
    canvas.push({ type: "line", x1: PAD_L, y1: y, x2: PAD_L + innerW, y2: y, lineWidth: 0.2, lineColor: "#e2e8f0" });
    yTicks.push({ y, label: Number.isInteger(v) ? String(v) : v.toFixed(1) });
  }

  buckets.forEach((b, idx) => {
    const baseX = PAD_L + idx * groupW + groupW / 2 - colW - gap / 2;
    const total = b.total ?? 0;
    const patient = b.patientSource ?? 0;
    const hTotal = max > 0 ? (total / max) * innerH : 0;
    const hPatient = max > 0 ? (patient / max) * innerH : 0;
    canvas.push({
      type: "rect",
      x: baseX,
      y: PAD_T + innerH - hTotal,
      w: colW,
      h: hTotal,
      color: "#3b82f6",
    });
    canvas.push({
      type: "rect",
      x: baseX + colW + gap,
      y: PAD_T + innerH - hPatient,
      w: colW,
      h: hPatient,
      color: "#8b5cf6",
    });
  });

  // Прореживаем метки X — на длинных окнах подписи наезжают.
  const stride = Math.max(1, Math.ceil(n / 10));
  const xLabels = buckets
    .map((b, idx) => {
      if (idx % stride !== 0 && idx !== n - 1) return null;
      const x = PAD_L + idx * groupW + groupW / 2;
      return {
        text: fmtDayMonth(b.bucketStart),
        absolutePosition: { x: x - 14, y: PAD_T + innerH + 6 },
        fontSize: 7,
        color: "#666",
      };
    })
    .filter(Boolean);

  const yLabels = yTicks.map((t) => ({
    text: t.label,
    absolutePosition: { x: 0, y: t.y - 4 },
    fontSize: 7,
    color: "#666",
    width: PAD_L - 4,
    alignment: "right" as const,
  }));

  return {
    stack: [
      { canvas },
      ...yLabels,
      ...xLabels,
      {
        columns: [
          {
            width: "auto",
            stack: [
              {
                canvas: [
                  { type: "rect", x: 0, y: 4, w: 10, h: 8, color: "#3b82f6" },
                ],
              },
            ],
          },
          { text: "Всего НС", fontSize: 8, color: "#444", margin: [4, 2, 14, 0] as [number, number, number, number], width: "auto" },
          {
            width: "auto",
            stack: [
              {
                canvas: [
                  { type: "rect", x: 0, y: 4, w: 10, h: 8, color: "#8b5cf6" },
                ],
              },
            ],
          },
          { text: "От пациентов", fontSize: 8, color: "#444", margin: [4, 2, 0, 0] as [number, number, number, number], width: "auto" },
          { text: "", width: "*" },
        ],
        margin: [PAD_L, 4, 0, 0] as [number, number, number, number],
      },
    ],
    margin: [0, 4, 0, 14] as [number, number, number, number],
  };
}

function buildDoc(p: ExportPayload) {
  const events = p.events;
  const sum = p.summary;

  // total из summary — это полная цифра по периоду; events.length меньше из-за пагинации.
  const total = sum?.total ?? events.length;

  const statusEntries: Array<[string, number]> = sum?.byStatus
    ? ([
        ["pending", sum.byStatus.pending ?? 0],
        ["in_progress", sum.byStatus.inProgress ?? 0],
        ["done", sum.byStatus.done ?? 0],
        ["rejected", sum.byStatus.rejected ?? 0],
        ["cancelled", sum.byStatus.cancelled ?? 0],
      ] as Array<[string, number]>)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
    : countBy(events, (e) => e.status || "unspecified");

  const priorityEntries: Array<[string, number]> = sum?.byPriority
    ? ([
        ["critical", sum.byPriority.critical ?? 0],
        ["high", sum.byPriority.high ?? 0],
        ["normal", sum.byPriority.normal ?? 0],
        ["low", sum.byPriority.low ?? 0],
      ] as Array<[string, number]>)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
    : countBy(events, (e) => e.priority || "unspecified");

  const sourceEntries: Array<[string, number]> = sum?.bySource
    ? ([
        ["staff", sum.bySource.staff ?? 0],
        ["patient", sum.bySource.patient ?? 0],
      ] as Array<[string, number]>).filter(([, v]) => v > 0)
    : [
        ["staff", events.filter((e) => !e.isPatientSource).length],
        ["patient", events.filter((e) => e.isPatientSource).length],
      ];

  const patientSourced = sum?.bySource?.patient ?? events.filter((e) => e.isPatientSource).length;
  const reopened = sum?.reopened ?? events.filter((e) => e.isReopened).length;
  const withRequests = sum?.withLinkedRequests ?? events.filter((e) => (e.linkedRequestsCount ?? 0) > 0).length;
  const closedFromStatus =
    (sum?.byStatus?.done ?? 0) + (sum?.byStatus?.cancelled ?? 0) + (sum?.byStatus?.rejected ?? 0);
  const closed = sum?.byStatus
    ? closedFromStatus
    : events.filter((e) => !!e.closedAt).length;
  const open = Math.max(0, total - closed);

  const r = sum?.resolution;
  const p50 = fmtMinutes(r?.p50Minutes);
  const p90 = fmtMinutes(r?.p90Minutes);
  const p95 = fmtMinutes(r?.p95Minutes);

  const topCategories: Array<[string, number]> = sum?.topCategories?.length
    ? sum.topCategories.map((c) => [c.categoryName || "Без категории", c.count ?? 0])
    : countBy(events, (e) => e.categoryName || "Без категории");

  const topTypes: Array<[string, number]> = sum?.topTypes?.length
    ? sum.topTypes.map((t) => [t.typeName || "—", t.count ?? 0])
    : countBy(events, (e) => e.typeName || "—");

  const topDepartments: Array<[string, number]> = (sum?.topDepartments ?? [])
    .map((d) => [d.departmentName || "—", d.count ?? 0] as [string, number]);

  const maxCategoryCount = topCategories[0]?.[1] ?? total;
  const maxTypeCount = topTypes[0]?.[1] ?? total;
  const maxDeptCount = topDepartments[0]?.[1] ?? total;

  const tableRows = events.map((e, i) => [
    { text: String(i + 1), alignment: "center" },
    fmtDate(e.createdAt),
    fmtDate(e.occurredAt),
    e.typeName || "—",
    e.categoryName || "—",
    {
      text: statusLabel(e.status),
      color: "#fff",
      fillColor: STATUS_COLOR[e.status || "unspecified"] || "#94a3b8",
      alignment: "center",
      bold: true,
    },
    {
      text: priorityLabel(e.priority),
      color: "#fff",
      fillColor: PRIORITY_COLOR[e.priority || "unspecified"] || "#94a3b8",
      alignment: "center",
      bold: true,
    },
    e.closedAt ? fmtDate(e.closedAt) : { text: "—", color: "#94a3b8", alignment: "center" },
    { text: String(e.linkedRequestsCount ?? 0), alignment: "center" },
  ]);

  const kpiTile = (label: string, value: string | number, color = "#111") => ({
    stack: [
      { text: String(value), fontSize: 18, bold: true, color, margin: [0, 0, 0, 2] as [number, number, number, number] },
      { text: label, fontSize: 9, color: "#666" },
    ],
    margin: [0, 0, 0, 0] as [number, number, number, number],
  });

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [32, 48, 32, 56] as [number, number, number, number],
    defaultStyle: { fontSize: 9 },
    info: {
      title: "Журнал учёта нежелательных событий",
      author: p.generatedBy || "МедИнцидент",
      subject: "Внутренний контроль качества (приказ Минздрава РФ № 785н от 31.07.2020)",
    },

    content: [
      { text: "Журнал учёта нежелательных событий", style: "h1" },
      {
        text: "Внутренний контроль качества и безопасности медицинской деятельности — приказ Минздрава России от 31.07.2020 № 785н.",
        style: "muted",
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      {
        layout: "noBorders",
        table: {
          widths: ["auto", "*"],
          body: [
            [{ text: "Организация:", bold: true }, p.organization || "—"],
            [
              { text: "Период:", bold: true },
              `${p.periodLabel} (${fmtDate(p.fromIso)} — ${fmtDate(p.toIso)})`,
            ],
            [{ text: "Дата формирования:", bold: true }, fmtDate(p.generatedAtIso, true)],
            [{ text: "Сформировал:", bold: true }, p.generatedBy || "—"],
          ],
        },
        margin: [0, 0, 0, 14] as [number, number, number, number],
      },

      { text: "Сводка", style: "h2" },
      {
        columns: [
          kpiTile("Всего НС", total),
          kpiTile("Открытых", open, "#f59e0b"),
          kpiTile("Закрытых / отменённых", closed, "#10b981"),
          kpiTile("От пациентов", patientSourced, "#8b5cf6"),
          kpiTile("Переоткрытых", reopened),
          kpiTile("С заявками", withRequests, "#3b82f6"),
        ],
        columnGap: 12,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },

      ...(r
        ? [
            { text: "Время закрытия НС (от регистрации до перевода в done/cancelled/rejected):", style: "muted", margin: [0, 0, 0, 4] as [number, number, number, number] },
            {
              columns: [
                kpiTile("Медиана (p50)", p50, "#10b981"),
                kpiTile("p90", p90, "#f59e0b"),
                kpiTile("p95", p95, "#ef4444"),
                kpiTile("Среднее", fmtMinutes(r.avgMinutes), "#3b82f6"),
                kpiTile("Минимум", fmtMinutes(r.minMinutes)),
                kpiTile("Максимум", fmtMinutes(r.maxMinutes)),
              ],
              columnGap: 12,
              margin: [0, 0, 0, 14] as [number, number, number, number],
            },
          ]
        : [{ text: "", margin: [0, 0, 0, 4] as [number, number, number, number] }]),

      total === 0
        ? { text: "За выбранный период событий нет.", style: "muted", margin: [0, 0, 0, 14] as [number, number, number, number] }
        : {
            columns: [
              {
                width: "*",
                stack: [
                  { text: "По статусу", style: "h3" },
                  {
                    layout: "noBorders",
                    table: {
                      widths: [90, BAR_MAX_W, "auto"],
                      body: statusEntries.map(([k, v]) =>
                        barRow(statusLabel(k), v, total, STATUS_COLOR[k] || "#94a3b8"),
                      ),
                    },
                  },
                ],
              },
              {
                width: "*",
                stack: [
                  { text: "По приоритету", style: "h3" },
                  {
                    layout: "noBorders",
                    table: {
                      widths: [90, BAR_MAX_W, "auto"],
                      body: priorityEntries.map(([k, v]) =>
                        barRow(priorityLabel(k), v, total, PRIORITY_COLOR[k] || "#94a3b8"),
                      ),
                    },
                  },
                ],
              },
            ],
            columnGap: 24,
            margin: [0, 0, 0, 10] as [number, number, number, number],
          },

      ...(total > 0 && sourceEntries.length > 0
        ? [
            { text: "По источнику", style: "h3" },
            {
              layout: "noBorders",
              table: {
                widths: [90, BAR_MAX_W, "auto"],
                body: sourceEntries.map(([k, v]) =>
                  barRow(
                    k === "patient" ? "От пациентов" : "От сотрудников",
                    v,
                    total,
                    SOURCE_COLOR[k] || "#94a3b8",
                  ),
                ),
              },
              margin: [0, 0, 0, 14] as [number, number, number, number],
            },
          ]
        : []),

      ...(p.timeseries && p.timeseries.length > 0
        ? [
            { text: "Динамика регистрации НС за период", style: "h2", pageBreak: "before" },
            {
              text: "Колонки — общее число НС за каждый бакет (день/неделя) и доля НС от пациентов.",
              style: "muted",
              margin: [0, 0, 0, 0] as [number, number, number, number],
            },
            buildTimeseriesChart(p.timeseries),
          ]
        : []),

      ...(topCategories.length > 0
        ? [
            { text: "Анализ причин: распределение по категориям", style: "h2", pageBreak: p.timeseries?.length ? undefined : (total > 6 ? "before" : undefined) },
            {
              text: "Парето: категории с наибольшей частотой — приоритет для корректирующих мер (п. 9 приказа № 785н).",
              style: "muted",
              margin: [0, 0, 0, 4] as [number, number, number, number],
            },
            {
              layout: "noBorders",
              table: {
                widths: ["*", BAR_MAX_W, "auto"],
                body: topCategories
                  .slice(0, 8)
                  .map(([cat, v]) => barRow(cat, v, maxCategoryCount, "#3b82f6")),
              },
              margin: [0, 0, 0, 12] as [number, number, number, number],
            },
          ]
        : []),

      ...(topTypes.length > 0
        ? [
            { text: "Топ типов событий", style: "h3" },
            {
              layout: "noBorders",
              table: {
                widths: ["*", BAR_MAX_W, "auto"],
                body: topTypes
                  .slice(0, 6)
                  .map(([typ, v]) => barRow(typ, v, maxTypeCount, "#8b5cf6")),
              },
              margin: [0, 0, 0, 14] as [number, number, number, number],
            },
          ]
        : []),

      ...(topDepartments.length > 0
        ? [
            { text: "Топ отделений по количеству НС", style: "h2" },
            {
              text: "Подразделения, где чаще регистрируются НС — направления для углублённого аудита.",
              style: "muted",
              margin: [0, 0, 0, 4] as [number, number, number, number],
            },
            {
              layout: "noBorders",
              table: {
                widths: ["*", BAR_MAX_W, "auto"],
                body: topDepartments
                  .slice(0, 8)
                  .map(([d, v]) => barRow(d, v, maxDeptCount, "#10b981")),
              },
              margin: [0, 0, 0, 16] as [number, number, number, number],
            },
          ]
        : []),

      { text: "Корректирующие и предупреждающие действия (CAPA)", style: "h2", pageBreak: "before" },
      {
        text: "Заполняется ответственным за качество. Строки — по топ-категориям выше; добавьте свои при необходимости (п. 10–11 приказа № 785н).",
        style: "muted",
        margin: [0, 0, 0, 4] as [number, number, number, number],
      },
      {
        layout: capaLayout,
        table: {
          headerRows: 1,
          widths: [20, "*", "*", "*", 80, 80],
          body: [
            [
              { text: "№", bold: true, alignment: "center" },
              { text: "Категория / тип НС", bold: true },
              { text: "Установленная причина", bold: true },
              { text: "Корректирующая / предупреждающая мера", bold: true },
              { text: "Ответственный", bold: true, alignment: "center" },
              { text: "Срок", bold: true, alignment: "center" },
            ],
            ...(topCategories.slice(0, 5).length > 0
              ? topCategories.slice(0, 5).map(([cat, v], i) => [
                  { text: String(i + 1), alignment: "center" },
                  `${cat}\n(событий: ${v})`,
                  " ",
                  " ",
                  " ",
                  " ",
                ])
              : [["1", " ", " ", " ", " ", " "]]),
            ...Array.from({ length: 3 }, (_, i) => [
              { text: String((topCategories.slice(0, 5).length || 1) + i + 1), alignment: "center", color: "#999" },
              " ", " ", " ", " ", " ",
            ]),
          ],
        },
        margin: [0, 0, 0, 18] as [number, number, number, number],
      },

      { text: "Журнал событий", style: "h2", pageBreak: "before" },
      events.length === 0
        ? { text: "За выбранный период событий не зарегистрировано.", style: "muted", margin: [0, 4, 0, 14] as [number, number, number, number] }
        : {
            table: {
              headerRows: 1,
              widths: [18, 60, 60, "*", "*", 50, 55, 60, 35],
              body: [
                [
                  { text: "№", bold: true, alignment: "center" },
                  { text: "Зарегистрировано", bold: true },
                  { text: "Произошло", bold: true },
                  { text: "Тип события", bold: true },
                  { text: "Категория", bold: true },
                  { text: "Статус", bold: true, alignment: "center" },
                  { text: "Приоритет", bold: true, alignment: "center" },
                  { text: "Закрыто", bold: true, alignment: "center" },
                  { text: "Заявок", bold: true, alignment: "center" },
                ],
                ...tableRows,
              ],
            },
            layout: tableLayout,
            margin: [0, 0, 0, 18] as [number, number, number, number],
          },

      {
        columns: [
          {
            text: "Ответственный за качество и безопасность мед. деятельности:\n____________________________ /                                  /",
            width: "*",
          },
          {
            text: `Дата: ${fmtDate(p.generatedAtIso)}`,
            width: "auto",
            alignment: "right",
            margin: [0, 12, 0, 0] as [number, number, number, number],
          },
        ],
      },
    ],

    styles: {
      h1: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] as [number, number, number, number] },
      h2: { fontSize: 12, bold: true, margin: [0, 6, 0, 4] as [number, number, number, number] },
      h3: { fontSize: 10, bold: true, margin: [0, 4, 0, 4] as [number, number, number, number], color: "#444" },
      muted: { fontSize: 9, color: "#666666" },
    },

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: `МедИнцидент • ${p.organization || ""}`,
          fontSize: 8,
          color: "#888",
          margin: [32, 0, 0, 0] as [number, number, number, number],
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: "right",
          fontSize: 8,
          color: "#888",
          margin: [0, 0, 32, 0] as [number, number, number, number],
        },
      ],
    }),
  };
}

const tableLayout = {
  fillColor: (rowIndex: number) =>
    rowIndex === 0 ? "#e9ecef" : rowIndex % 2 === 0 ? "#fafafa" : null,
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => "#c4c4c4",
  vLineColor: () => "#c4c4c4",
};

const capaLayout = {
  fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e9ecef" : null),
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => "#c4c4c4",
  vLineColor: () => "#c4c4c4",
  paddingTop: () => 10,
  paddingBottom: () => 10,
};
