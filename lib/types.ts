// --- РОЛИ И ПОЛЬЗОВАТЕЛИ ---
export type UserRole =
  | "worker" // Работник
  | "head_dept" // Руководитель отделения
  | "head_clinic" // Зав. клиникой
  | "admin_org" // Администратор организации
  | "admin_system" // Админ системы
  | "dispatcher_ns" // Диспетчер НС (Нежелательные события)
  | "dispatcher_req" // Диспетчер Заявок
  | "guest"; // Гость

export interface User {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  clinicId: string;
  isActing?: boolean; // Флаг И.О. (заместителя)
}

// --- ЗАЯВКИ (SERVICE REQUESTS) ---

export type ServiceType =
  | "med_equip" // Медицинское оборудование
  | "it_equip" // Компьютерное оборудование
  | "energy" // Энергетическая и лифтовая служба
  | "ventilation" // Вентиляция
  | "plumbing" // Сантехники
  | "housekeeping" // Хозяйственная служба
  | "territory" // Служба содержания территории
  | "buildings" // Служба эксплуатации зданий (ОКС)
  | "control"; // Контрольно-инспекционный отдел

export type RequestStatus =
  | "created" // Принята (автоматически)
  | "processed" // Обработана
  | "in_work" // В работе
  | "purchase" // Закупка запчастей
  | "completed" // Выполнена
  | "refused" // Отказ
  | "cancelled"; // Отмена

export type Priority = "normal" | "urgent" | "critical";

export interface ServiceRequest {
  id: string;
  number: number; // Человекочитаемый номер (напр. 1024)
  type: ServiceType;
  priority: Priority;
  status: RequestStatus;
  description: string;
  location: string; // Кабинет/Место
  authorId: string;
  authorName: string;
  departmentId: string; // Отделение-заказчик
  createdAt: string; // ISO Date
  linkedEventId?: string; // Связь с НС (если есть)
  comments?: number; // Кол-во комментариев
}

// --- СПРАВОЧНИКИ (CONSTANTS) ---

export const SERVICE_TYPES_MAP: Record<ServiceType, string> = {
  med_equip: "Медицинское оборудование",
  it_equip: "IT и Оргтехника",
  energy: "Электрика и Лифты",
  ventilation: "Вентиляция и Газы",
  plumbing: "Сантехника и Отопление",
  housekeeping: "Хозяйственная служба",
  territory: "Содержание территории",
  buildings: "Ремонт зданий (ОКС)",
  control: "Контроль и инспекция",
};

export const PRIORITY_MAP: Record<Priority, string> = {
  normal: "Нормальный",
  urgent: "Срочный",
  critical: "Критический",
};

export const STATUS_MAP: Record<RequestStatus, string> = {
  created: "Принята",
  processed: "Обработана",
  in_work: "В работе",
  purchase: "Закупка запчастей",
  completed: "Выполнена",
  refused: "Отказ",
  cancelled: "Отмена",
};

export type EventSeverity =
  | "near_miss"
  | "minor"
  | "moderate"
  | "severe"
  | "critical";
