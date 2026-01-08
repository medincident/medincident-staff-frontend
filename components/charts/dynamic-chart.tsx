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
  Legend
} from "recharts";

// Профессиональная палитра (спокойные цвета, подходящие под медицину/офис)
const COLORS = [
  "#2563eb", // blue-600
  "#0891b2", // cyan-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#475569", // slate-600
];

// Кастомный Тултип (Всплывашка) в стиле Shadcn
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border text-popover-foreground shadow-lg rounded-lg p-3 min-w-[150px]">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: payload[0].fill }} 
          />
          <span className="text-sm font-bold">
            {payload[0].value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface DynamicChartProps {
  data: { name: string; value: number }[];
  type: "bar" | "pie";
  title?: string;
  height?: number;
}

export function DynamicChart({ data, type, title, height = 300 }: DynamicChartProps) {
  // Заглушка, если данных нет
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl bg-muted/10" style={{ height }}>
        <p className="text-muted-foreground text-sm font-medium">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Заголовок графика */}
      {title && (
        <h3 className="text-sm font-semibold mb-4 text-foreground tracking-tight">
          {title}
        </h3>
      )}
      
      <div style={{ height }} className="w-full font-sans">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            // === ГРАФИК СТОЛБЦЫ (BAR) ===
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={false} // Убрали горизонтальные линии
                vertical={true}    // Оставили вертикальные
                stroke="#e5e7eb"   // Очень светлый серый
                opacity={0.5}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={140} // Ширина под длинные названия
                tick={{ fontSize: 11, fill: '#64748b' }} // Цвет текста slate-500
                axisLine={false} // Убрали жирную ось
                tickLine={false} // Убрали засечки
                interval={0}     // Показывать все подписи
              />
              <XAxis 
                type="number" 
                hide // Скрыли нижнюю ось с цифрами (чистота)
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9', opacity: 0.5 }} // Подсветка строки при наведении
                content={<CustomTooltip />}
              />
              <Bar 
                dataKey="value" 
                barSize={24} // Толщина полоски
                radius={[0, 6, 6, 0]} // Скругление концов
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    // Добавляем прозрачность при наведении (Recharts сам это не делает, но цвета подобраны)
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            // === ГРАФИК ПОНЧИК (DONUT/PIE) ===
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60} // Делает дырку внутри (Пончик)
                outerRadius={85}
                paddingAngle={4} // Отступы между кусками
                cornerRadius={5} // Закругленные края кусков
                dataKey="value"
                stroke="none" // Убираем обводку
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-600 ml-1">{value}</span>}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}