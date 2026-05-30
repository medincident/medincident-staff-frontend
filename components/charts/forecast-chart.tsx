"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const AXIS_COLOR = "#94a3b8";

export type ForecastChartPoint = {
  name: string;
  // Историческая часть
  "Заявки"?: number | null;
  "Инциденты"?: number | null;
  // Прогноз
  "Заявки_прогноз"?: number | null;
  "Инциденты_прогноз"?: number | null;
  // 95% ДИ
  "Заявки_ДИ"?: [number, number] | null;
  "Инциденты_ДИ"?: [number, number] | null;
  // Флаг, по которому определяем начало прогноза
  isForecast?: boolean;
};

export type ChangePointMarker = {
  name: string; // x-координата
  label?: string; // подпись у линии, напр. "+34% заявок"
  color?: string;
};

type Props = {
  data: ForecastChartPoint[];
  forecastStartName?: string;
  height?: number;
  reqColor?: string;
  evtColor?: string;
  changePoints?: ChangePointMarker[];
  capaMarkers?: ChangePointMarker[];
  showRequests?: boolean;
};

function Legend_({ payload }: any) {
  if (!payload) return null;
  const items = payload.filter((e: any) => e.type !== "none");
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs pb-2">
      {items.map((entry: any) => (
        <span key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </span>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const byKey: Record<string, any> = {};
  payload.forEach((p: any) => {
    byKey[p.dataKey] = p;
  });

  const rows: Array<{ label: string; value: string; color: string; isForecast: boolean }> = [];

  (["Заявки", "Инциденты"] as const).forEach((metric) => {
    const actual = byKey[metric];
    const forecastMean = byKey[`${metric}_прогноз`];
    const ci = byKey[`${metric}_ДИ`];

    if (actual && actual.value != null) {
      rows.push({
        label: metric,
        value: String(actual.value),
        color: actual.color || actual.stroke,
        isForecast: false,
      });
    }
    if (forecastMean && forecastMean.value != null && (!actual || actual.value == null)) {
      const ciVal = ci?.value as [number, number] | undefined;
      rows.push({
        label: `${metric} (прогноз)`,
        value:
          ciVal && Array.isArray(ciVal)
            ? `${Number(forecastMean.value).toFixed(1)} (${ciVal[0].toFixed(1)}–${ciVal[1].toFixed(1)})`
            : Number(forecastMean.value).toFixed(1),
        color: forecastMean.color || forecastMean.stroke,
        isForecast: true,
      });
    }
  });

  return (
    <div className="bg-popover border border-border text-popover-foreground rounded-lg p-3 min-w-[170px] shadow-sm">
      {label && <p className="text-sm font-semibold mb-1.5">{label}</p>}
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <span className="text-xs text-popover-foreground">
            {row.label}: <span className="font-bold">{row.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export function ForecastChart({
  data,
  forecastStartName,
  height = 360,
  reqColor = "#3b82f6",
  evtColor = "#f59e0b",
  changePoints = [],
  capaMarkers = [],
  showRequests = true,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl bg-muted/10"
        style={{ height }}
      >
        <p className="text-muted-foreground text-sm font-medium">Нет данных</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full font-sans text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-req-hist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={reqColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={reqColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-evt-hist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={evtColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={evtColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
          <XAxis
            dataKey="name"
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<Legend_ />} verticalAlign="top" />

          {/* 95% ДИ — серые зоны для каждой метрики */}
          {showRequests && (
            <Area
              type="monotone"
              dataKey="Заявки_ДИ"
              name="95% ДИ (заявки)"
              legendType="none"
              stroke="none"
              fill={reqColor}
              fillOpacity={0.08}
              isAnimationActive={false}
              connectNulls
            />
          )}
          <Area
            type="monotone"
            dataKey="Инциденты_ДИ"
            name="95% ДИ (НС)"
            legendType="none"
            stroke="none"
            fill={evtColor}
            fillOpacity={0.08}
            isAnimationActive={false}
            connectNulls
          />

          {/* Исторические области */}
          {showRequests && (
            <Area
              type="monotone"
              dataKey="Заявки"
              stroke={reqColor}
              strokeWidth={2}
              fill="url(#grad-req-hist)"
              fillOpacity={1}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="Инциденты"
            stroke={evtColor}
            strokeWidth={2}
            fill="url(#grad-evt-hist)"
            fillOpacity={1}
            connectNulls={false}
            isAnimationActive={false}
          />

          {/* Линии прогноза — пунктир */}
          {showRequests && (
            <Line
              type="monotone"
              dataKey="Заявки_прогноз"
              name="Заявки (прогноз)"
              legendType="none"
              stroke={reqColor}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 2, fill: reqColor }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="Инциденты_прогноз"
            name="Инциденты (прогноз)"
            legendType="none"
            stroke={evtColor}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 2, fill: evtColor }}
            connectNulls={false}
            isAnimationActive={false}
          />

          {changePoints.map((cp, i) => (
            <ReferenceLine
              key={`cp-${i}-${cp.name}`}
              x={cp.name}
              stroke={cp.color ?? "#ef4444"}
              strokeDasharray="4 3"
              strokeOpacity={0.6}
              label={
                cp.label
                  ? {
                      value: cp.label,
                      position: "insideTopLeft",
                      fill: cp.color ?? "#ef4444",
                      fontSize: 10,
                      fontWeight: 600,
                    }
                  : undefined
              }
            />
          ))}

          {capaMarkers.map((cp, i) => (
            <ReferenceLine
              key={`capa-${i}-${cp.name}`}
              x={cp.name}
              stroke={cp.color ?? "#10b981"}
              strokeWidth={1.5}
              label={
                cp.label
                  ? {
                      value: cp.label,
                      position: "insideBottomLeft",
                      fill: cp.color ?? "#10b981",
                      fontSize: 10,
                      fontWeight: 600,
                    }
                  : undefined
              }
            />
          ))}

          {forecastStartName && (
            <ReferenceLine
              x={forecastStartName}
              stroke={AXIS_COLOR}
              strokeDasharray="2 3"
              label={{
                value: "сегодня",
                position: "top",
                fill: AXIS_COLOR,
                fontSize: 10,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
