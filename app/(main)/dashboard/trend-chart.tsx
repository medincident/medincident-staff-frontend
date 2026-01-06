"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const DATA = [
  { name: "Пн", count: 4 },
  { name: "Вт", count: 7 },
  { name: "Ср", count: 5 },
  { name: "Чт", count: 12 },
  { name: "Пт", count: 9 },
  { name: "Сб", count: 3 },
  { name: "Вс", count: 4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        <p className="text-sm text-primary">
          Событий: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function TrendChart() {
  const primaryColor = "#8DC63F"; 

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/20" />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12, fill: 'currentColor' }} 
            className="text-muted-foreground"
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12, fill: 'currentColor' }} 
            className="text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: primaryColor, strokeWidth: 1 }} />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke={primaryColor} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}