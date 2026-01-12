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
    return (
      <div className="bg-popover border border-border text-popover-foreground rounded-lg p-3 min-w-[150px]">
        <p className="text-sm font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
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
  type: "bar" | "bar-vertical" | "pie" | "donut" | "area";
  title?: string;
  height?: number;
  dataKey?: string;
  categoryKey?: string;
  color?: string;
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

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-sm font-semibold mb-4 text-foreground tracking-tight">
          {title}
        </h3>
      )}
      
      <div style={{ height }} className="w-full font-sans text-xs">
        <ResponsiveContainer width="100%" height="100%">
          
          {/* === 1. ГОРИЗОНТАЛЬНЫЕ СТОЛБЦЫ (BAR) === */}
          {type === "bar" ? (
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
              <Bar dataKey={dataKey} barSize={20} radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
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
              <Bar dataKey={dataKey} barSize={32} radius={[4, 4, 0, 0]} fill={color || COLORS[0]} />
            </BarChart>

          /* === 3. ОБЛАСТЬ/ЛИНЕЙНЫЙ (AREA) === */
          ) : type === "area" ? (
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color || COLORS[0]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color || COLORS[0]} stopOpacity={0}/>
                </linearGradient>
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
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color || COLORS[0]} 
                fillOpacity={1} 
                fill={`url(#color${dataKey})`} 
                strokeWidth={2}
              />
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
                dataKey={dataKey}
                nameKey={categoryKey}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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