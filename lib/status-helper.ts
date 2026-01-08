import { Priority, RequestStatus } from "@/lib/types";

// Цвета для статусов ЗАЯВОК
export const getRequestStatusColor = (status: RequestStatus) => {
  switch (status) {
    case "created":
      return "bg-slate-100 text-slate-600 border-slate-200"; // Серый
    case "processed":
      return "bg-blue-50 text-blue-600 border-blue-200"; // Синий
    case "in_work":
      return "bg-indigo-50 text-indigo-600 border-indigo-200"; // Индиго
    case "purchase":
      return "bg-purple-50 text-purple-600 border-purple-200"; // Фиолетовый (ожидание)
    case "completed":
      return "bg-emerald-50 text-emerald-600 border-emerald-200"; // Зеленый
    case "refused":
      return "bg-red-50 text-red-600 border-red-200"; // Красный
    case "cancelled":
      return "bg-gray-100 text-gray-400 border-gray-200 line-through"; // Зачеркнутый
    default:
      return "bg-slate-100 text-slate-600";
  }
};

// Цвета для ПРИОРИТЕТОВ
export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "critical":
      return "text-red-600 bg-red-100 border-red-200";
    case "urgent":
      return "text-orange-600 bg-orange-100 border-orange-200";
    case "normal":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-slate-600";
  }
};

// Цвета для ИВЕНТОВ
export const getStatusColor = (st: string) => {
  switch (st) {
    case "Зарегистрировано":
      return "bg-muted/50 text-muted-foreground border-border";
    case "В работе":
      return "bg-warning/15 text-warning border-warning/20";
    case "Выполнено":
      return "bg-success/15 text-success border-success/20";
    case "Отказано":
      return "bg-destructive/15 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};
