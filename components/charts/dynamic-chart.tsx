"use client";

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from "recharts";

// Профессиональная палитра
const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#64748b", // slate-500
];

// Цвет текста осей (Slate-400 - хорошо виден везде)
const AXIS_COLOR = "#94a3b8"; 

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    if (payload.length === 1 && payload[0].name === "value") {
      return (
        <div className="bg-popover border border-border text-popover-foreground rounded-lg p-2.5 min-w-[120px] shadow-sm flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: payload[0].fill || payload[0].color }} 
          />
          <span className="text-sm text-popover-foreground">
            {label ? `${label}: ` : ""}<span className="font-bold">{payload[0].value}</span>
          </span>
        </div>
      );
    }

    return (
      <div className="bg-popover border border-border text-popover-foreground rounded-lg p-3 min-w-[150px] shadow-sm">
        {label && <p className="text-sm font-semibold mb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: entry.fill || entry.color }} 
            />
            <span className="text-sm text-popover-foreground">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface DynamicChartProps {
  data: any[];
  type: "bar" | "bar-horizontal" | "bar-vertical" | "pie" | "donut" | "area";
  title?: string;
  height?: number;
  dataKey?: string | string[]; // Теперь поддерживает массив ключей
  categoryKey?: string;
  color?: string | string[];   // Теперь поддерживает массив цветов
}

export function DynamicChart({ 
  data, 
  type, 
  title, 
  height = 300,
  dataKey = "value",
  categoryKey = "name",
  color
}: DynamicChartProps) {

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl bg-muted/10" style={{ height }}>
        <p className="text-muted-foreground text-sm font-medium">Нет данных</p>
      </div>
    );
  }

  // Нормализуем ключи и цвета в массивы
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];
  const colors = Array.isArray(color) ? color : [color || COLORS[0]];
  const isMulti = keys.length > 1;

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-sm font-semibold mb-4 text-foreground tracking-tight">
          {title}
        </h3>
      )}
      
      <div style={{ height }} className="w-full font-sans text-xs">
        <ResponsiveContainer width="100%" height="100%">
          
          {/* === 1. ГОРИЗОНТАЛЬНЫЕ СТОЛБЦЫ (BAR / BAR-HORIZONTAL) === */}
          {type === "bar" || type === "bar-horizontal" ? (
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e2e8f0" opacity={0.2} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey={categoryKey} 
                type="category" 
                width={120} 
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                axisLine={false} 
                tickLine={false} 
                interval={0}
              />
              <Tooltip cursor={{ fill: 'currentColor', opacity: 0.1 }} content={<CustomTooltip />} />
              {isMulti && <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />}
              
              {keys.map((key, i) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  barSize={isMulti ? 12 : 20} 
                  radius={[0, 4, 4, 0]}
                  fill={isMulti ? colors[i % colors.length] : undefined} // Если много ключей, красим из массива цветов
                >
                  {/* Если ключ один, красим каждый столбец уникальным цветом (Cell) */}
                  {!isMulti && data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              ))}
            </BarChart>

          /* === 2. ВЕРТИКАЛЬНЫЕ СТОЛБЦЫ (BAR-VERTICAL) === */
          ) : type === "bar-vertical" ? (
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
              <XAxis 
                dataKey={categoryKey} 
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip cursor={{ fill: 'currentColor', opacity: 0.1 }} content={<CustomTooltip />} />
              {isMulti && <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />}
              
              {keys.map((key, i) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  barSize={isMulti ? 16 : 32} 
                  radius={[4, 4, 0, 0]} 
                  fill={colors[i % colors.length]} 
                >
                  {/* Если ключ один, раскрашиваем каждый столбец */}
                  {!isMulti && data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              ))}
            </BarChart>

          /* === 3. ОБЛАСТЬ/ЛИНЕЙНЫЙ (AREA) === */
          ) : type === "area" ? (
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {keys.map((key, i) => {
                  const safeId = key.replace(/\s+/g, '_'); // Убираем пробелы для ID градиента
                  return (
                    <linearGradient key={`grad-${key}`} id={`color_${safeId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
              <XAxis 
                dataKey={categoryKey} 
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
              {isMulti && <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />}
              
              {keys.map((key, i) => {
                const safeId = key.replace(/\s+/g, '_');
                return (
                  <Area 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[i % colors.length]} 
                    fillOpacity={1} 
                    fill={`url(#color_${safeId})`} 
                    strokeWidth={2}
                  />
                );
              })}
            </AreaChart>

          /* === 4. КРУГОВЫЕ (PIE / DONUT) === */
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="44%"
                innerRadius={type === "donut" ? 80 : 0} 
                outerRadius={110} 
                paddingAngle={type === "donut" ? 4 : 0}
                cornerRadius={type === "donut" ? 4 : 0}
                dataKey={keys[0]} // Pie всегда работает только с одним ключом
                nameKey={categoryKey}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                formatter={(value) => <span style={{ color: AXIS_COLOR }} className="text-xs ml-1">{value}</span>} 
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}