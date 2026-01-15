type ColorIntent =
  | "muted"
  | "info"
  | "warning"
  | "purple"
  | "success"
  | "destructive";

const STATUS_INTENTS: Record<string, ColorIntent> = {
  // --- Нейтральные (Синие/Серые) ---
  created: "muted",
  minor: "muted",

  // --- Информационные (Синие) ---
  processed: "info",
  check: "info",
  normal: "info",

  // --- Внимание (Желтые) ---
  in_work: "warning",
  investigation: "warning",
  urgent: "warning",
  moderate: "warning",

  // --- Ожидание/Спец (Фиолетовые) ---
  purchase: "purple",
  measures: "purple",

  // --- Успех (Зеленые) ---
  completed: "success",
  closed: "success",

  // --- Опасность/Отказ (Красные) ---
  refused: "destructive",
  cancelled: "destructive",
  critical: "destructive",
  severe: "destructive",

  // --- Типы уведомлений (Generic) ---
  info: "info",
  success: "success",
  error: "destructive",
  warning: "warning",
  default: "muted",
};

export const getIntentColors = (key: string) => {
  const intent = getIntent(key);

  switch (intent) {
    case "info":
      return {
        text: "text-info",
        bg: "bg-info/10",
        border: "border-info/20",
        fill: "fill-info",
      };
    case "warning":
      return {
        text: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning/20",
        fill: "fill-warning",
      };
    case "purple":
      return {
        text: "text-purple",
        bg: "bg-purple/10",
        border: "border-purple/20",
        fill: "fill-purple",
      };
    case "success":
      return {
        text: "text-success",
        bg: "bg-success/10",
        border: "border-success/20",
        fill: "fill-success",
      };
    case "destructive":
      return {
        text: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive/20",
        fill: "fill-destructive",
      };
    case "muted":
    default:
      return {
        text: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border",
        fill: "fill-muted",
      };
  }
};

const getIntent = (key: string): ColorIntent => {
  const normalizedKey = key?.toLowerCase() || "";
  return STATUS_INTENTS[normalizedKey] || "muted";
};

export const getIconColor = (key: string) => getIntentColors(key).text;

export const getBadgeColor = (key: string) => {
  const c = getIntentColors(key);
  if (getIntent(key) === "muted")
    return "font-medium text-[12px] border bg-muted text-muted-foreground border-border";
  return `font-medium text-[12px] border ${c.bg} ${c.text} ${c.border}`;
};

export const getCardBorderColor = (key: string) => {
  const intent = getIntent(key);
  switch (intent) {
    case "info":
      return "border-l-4 border-l-info";
    case "warning":
      return "border-l-4 border-l-warning";
    case "purple":
      return "border-l-4 border-l-purple";
    case "success":
      return "border-l-4 border-l-success";
    case "destructive":
      return "border-l-4 border-l-destructive";
    default:
      return "border-l-4 border-l-muted-foreground";
  }
};

export const CHART_COLORS: Record<string, string> = {
  // Статусы
  Новые: "hsl(var(--info))",
  "В работе": "hsl(var(--warning))",
  Завершены: "hsl(var(--success))",
  Отменены: "hsl(var(--destructive))",

  // Тяжесть / Приоритет
  Легкий: "hsl(var(--success))",
  Средний: "hsl(var(--warning))",
  Тяжелый: "hsl(var(--purple))",
  Критический: "hsl(var(--destructive))",

  // Общие
  Низкий: "hsl(var(--muted-foreground))",
  Высокий: "hsl(var(--primary))",

  default: "hsl(var(--primary))",
};

export const enrichChartData = (data: any[], colorMap = CHART_COLORS) => {
  if (!data) return [];
  return data.map((item) => ({
    ...item,
    fill: colorMap[item.name] || colorMap.default,
  }));
};
