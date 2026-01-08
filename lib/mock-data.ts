import { ServiceRequest, User } from "@/lib/types";

export const MOCK_USER: User = {
  id: "u_1",
  name: "Иванов Иван Иванович",
  role: "head_dept", // ПОМЕНЯЙТЕ ЭТУ РОЛЬ, ЧТОБЫ ТЕСТИРОВАТЬ РАЗНЫЕ ВИДЫ (worker, dispatcher_req, etc)
  departmentId: "dep_therapy",
  clinicId: "cl_main",
  isActing: false,
};

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "req_1",
    number: 1024,
    type: "it_equip",
    priority: "critical",
    status: "in_work",
    description:
      "Не работает сервер PACS в ординаторской, врачи не видят снимки.",
    location: "Кабинет 305",
    authorId: "u_1",
    authorName: "Иванов И.И.",
    departmentId: "dep_therapy",
    createdAt: "2024-01-25T10:30:00",
    comments: 2,
  },
  {
    id: "req_2",
    number: 1025,
    type: "plumbing",
    priority: "normal",
    status: "created",
    description: "Подтекает кран в процедурном кабинете.",
    location: "Процедурная №2",
    authorId: "u_5",
    authorName: "Петрова А.С.",
    departmentId: "dep_therapy",
    createdAt: "2024-01-26T09:15:00",
  },
  {
    id: "req_3",
    number: 1026,
    type: "energy",
    priority: "urgent",
    status: "purchase",
    description: "Мигает свет в коридоре, запах гари.",
    location: "Коридор 2 этаж",
    authorId: "u_1",
    authorName: "Иванов И.И.",
    departmentId: "dep_therapy",
    createdAt: "2024-01-24T14:00:00",
  },
  {
    id: "req_4",
    number: 1020,
    type: "housekeeping",
    priority: "normal",
    status: "completed",
    description: "Сломана ножка стула.",
    location: "Пост медсестры",
    authorId: "u_1",
    authorName: "Иванов И.И.",
    departmentId: "dep_therapy",
    createdAt: "2024-01-20T11:00:00",
  },
];

export const MOCK_EVENTS = [
  {
    id: "evt_1",
    code: "NS-2024-001",
    category: "fall", // Падение пациента
    severity: "minor",
    status: "investigation", // расследование
    description:
      "Падение пациента в коридоре. Споткнулся о загнутый край линолеума.",
    location: "Коридор 2 этаж, крыло А",
    authorName: "Сидорова Е.Е. (Медсестра)",
    createdAt: "2024-01-26T08:30:00",
    linkedRequestId: "req_101", // Пример связи (пока пустой)
  },
  {
    id: "evt_2",
    code: "NS-2024-002",
    category: "meds", // Ошибка лекарственная
    severity: "near_miss", // Почти случилось
    status: "closed",
    description:
      "Перепутаны назначения в листе, медсестра вовремя заметила ошибку до введения препарата.",
    location: "Палата 305",
    authorName: "Иванов И.И.",
    createdAt: "2024-01-25T14:20:00",
  },
  {
    id: "evt_3",
    code: "NS-2024-003",
    category: "infrastructure",
    severity: "moderate",
    status: "new",
    description:
      "Обрушение части подвесного потолка в ординаторской. Никто не пострадал.",
    location: "Ординаторская №1",
    authorName: "Петров В.В.",
    createdAt: "2024-01-27T09:00:00",
  },
];

export const SEVERITY_MAP: Record<string, string> = {
  near_miss: "Потенциальный риск",
  minor: "Легкий вред",
  moderate: "Средний вред",
  severe: "Тяжкий вред",
  critical: "Смерть",
};

export const EVENT_STATUS_MAP: Record<string, string> = {
  new: "Новое",
  investigation: "Расследование",
  measures: "Разработка мер",
  check: "Проверка",
  closed: "Закрыто",
};

export const SERVICE_TYPES_MAP: Record<string, string> = {
  med_equip: "Медицинское оборудование",
  it_equip: "Компьютерное оборудование",
  energy: "Энергетика и Лифты",
  ventilation: "Вентиляция",
  plumbing: "Сантехника и Водоснабжение",
  housekeeping: "Хозяйственная служба",
  territory: "Содержание территории",
  buildings: "Ремонт зданий (ОКС)",
  control: "Контрольно-инспекционный отдел",
};

// 2. Статусы заявок
export const STATUS_MAP: Record<string, string> = {
  created: "Принята",
  processed: "Обработана",
  in_work: "В работе",
  purchase: "Закупка запчастей",
  completed: "Выполнена",
  refused: "Отказ",
  cancelled: "Отмена",
};
