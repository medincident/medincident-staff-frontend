// lib/types.ts

// --- 1. РОЛИ ПОЛЬЗОВАТЕЛЕЙ (Строго по вашему списку) ---
export type UserRole =
  | "admin_system" // 7. Админ системы (видит все техническое)
  | "admin_org" // 6. Админ организации (видит все заявки/НС + аналитику)
  | "head_clinic" // 5. Зав. клиникой (видит свое подразделение и вложенные)
  | "head_dept" // 4. Руководитель (видит своих подчиненных)
  | "dispatcher_ns" // 2. Диспетчер НС (принимает все НС)
  | "dispatcher_req" // 1. Диспетчер заявок (принимает все заявки)
  | "manager_ns" // 9. Ответственный за обработку НС (по направлениям)
  | "manager_req" // 10. Ответственный по заявкам (по направлениям)
  | "worker" // 3. Работник (отправляет и смотрит свои)
  | "guest"; // 8. Гость (только статистика)

export type UserStatus = "active" | "blocked" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;

  // Привязка к структуре (для п. 3, 4, 5)
  clinicId?: string;
  departmentId?: string;

  // Доп. данные
  position?: string;
  login?: string;
  avatar?: string;

  // --- ДЛЯ ПУНКТОВ 9 и 10 (МАТРИЦА ОТВЕТСТВЕННОСТИ) ---
  // Массив ID категорий или типов, за которые отвечает пользователь.
  // Например: ["plumbing", "electric"] или ["safety", "medication"]
  responsibleCategories?: string[];
}

// --- СТРУКТУРА ОРГАНИЗАЦИИ ---
export interface Department {
  id: string;
  name: string;
  headId?: string; // ID руководителя
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  departments: Department[];
  headId?: string; // ID главврача
}

// --- СПРАВОЧНИКИ (КЛАССИФИКАТОР) ---
export type EventType = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  types: EventType[];
};

// --- ЗАЯВКИ (REQUESTS) ---
// Типы заявок (можно расширять)
export type ServiceType =
  | "med_equip"
  | "it_equip"
  | "it_soft"
  | "energy"
  | "ventilation"
  | "plumbing"
  | "housekeeping"
  | "territory"
  | "buildings"
  | "control"
  | "medical_equip"
  | "electric"
  | string; // string позволяет добавлять новые без правки кода типов

export type RequestStatus =
  | "created" // Новая (у диспетчера)
  | "in_work" // В работе (назначена ответственному)
  | "purchase" // Ожидание закупки
  | "completed" // Выполнена
  | "refused" // Отклонена
  | "cancelled"; // Отменена автором

export type Priority = "normal" | "high" | "critical";

export interface ServiceRequest {
  id: string;
  number: number;
  type: ServiceType;
  typeName?: string;

  responsibleDept: string; // Название отдела (текстом или ID)
  executorId?: string; // ID пользователя (manager_req), кто делает

  priority: Priority;
  status: RequestStatus;
  description: string;
  location: string;

  authorId?: string; // ID автора (User.id)
  authorName: string; // Для удобства отображения

  createdAt: string; // ISO Date
  completedAt?: string;

  linkedEventId?: string; // Связь с НС
  refusalReason?: string; // Причина отказа
}

// --- СОБЫТИЯ / ИНЦИДЕНТЫ (НС) ---
export type EventSeverity =
  | "near_miss"
  | "minor"
  | "moderate"
  | "severe"
  | "critical";

export type EventStatus =
  | "created" // Новое (у диспетчера)
  | "in_work" // В работе (назначено ответственному)
  | "investigation" // Расследование
  | "measures" // Меры приняты
  | "completed" // Завершено
  | "closed"; // Закрыто

export interface IncidentEvent {
  id: string;
  code: string; // Например INC-001

  categoryId: string; // ID категории из справочника
  categoryName?: string;

  typeId?: string; // ID типа из справочника
  typeName?: string;

  description?: string;

  status: EventStatus;
  severity: EventSeverity;

  authorId?: string; // ID автора
  author: string; // Имя автора

  responsibleId?: string; // ID пользователя (manager_ns), кто обрабатывает

  createdAt: string; // ISO String
}

// --- УВЕДОМЛЕНИЯ ---
export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: "high" | "normal";
  date: string;
}

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: NotificationType;
  date: string;
  read: boolean;
  userId?: string; // Кому предназначено (если personal)
}

// --- ДАШБОРД (ДЛЯ АДМИНОВ И ГОСТЕЙ) ---
export interface DashboardStats {
  kpi: {
    totalRequests: number;
    activeRequests: number;
    totalEvents: number;
    criticalEvents: number;
  };
  charts: {
    requestsByStatus: { name: string; value: number }[];
    requestsByCategory: { name: string; value: number }[];
    requestsByPriority: { name: string; value: number }[];
    eventsBySeverity: { name: string; value: number }[];
    eventsByCategory: { name: string; value: number }[];
    yearlyTrend: { name: string; requests: number }[];
  };
  performance: {
    closedOnTime: string;
    avgReactionTime: string;
    bestDepartment: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}