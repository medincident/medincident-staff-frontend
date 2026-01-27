import {
  Announcement,
  Category,
  Clinic,
  DashboardStats,
  IncidentEvent,
  Notification,
  ServiceRequest,
  User,
} from "./types";

// --- USERS (Пользователи) ---
export const MOCK_USERS: User[] = [
  {
    id: "u_1",
    name: "Иванов Иван Иванович",
    email: "ivanov@hospital.ru",
    role: "head_dept",
    position: "Зав. терапией",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_3",
    login: "i.ivanov",
  },
  {
    id: "u_2",
    name: "Петрова Анна Сергеевна",
    email: "petrova@hospital.ru",
    role: "worker",
    position: "Старшая медсестра",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_3",
    login: "a.petrova",
  },
  {
    id: "u_5",
    name: "Новикова Елена",
    email: "novikova@hospital.ru",
    role: "guest",
    position: "Стажер",
    status: "pending",
    clinicId: "cl_1",
    departmentId: "dep_1",
    login: "e.novikova",
  },
];

// --- CLINICS (Структура) ---
export const MOCK_CLINICS: Clinic[] = [
  {
    id: "cl_1",
    name: "ГКБ №1 им. Пирогова",
    address: "Ленинский проспект, 8",
    departments: [
      { id: "dep_1", name: "Приемное отделение" },
      { id: "dep_2", name: "Хирургия" },
      { id: "dep_3", name: "Терапия" },
      { id: "dep_4", name: "Отдел ИТ и связи" },
      { id: "dep_5", name: "Служба АХО (Эксплуатация)" },
      { id: "dep_6", name: "Лаборатория" },
    ],
  },
];

// --- EVENTS (ИНЦИДЕНТЫ / НС) ---
export let eventsDb: IncidentEvent[] = [
  {
    id: "evt_1",
    code: "INC-001",
    categoryId: "safety",
    typeId: "fall_patient",
    description:
      "Падение пациента в коридоре при транспортировке на каталке. Ушиб мягких тканей.",
    status: "completed",
    author: "Петрова А.С.",
    categoryName: "Безопасность пациента",
    typeName: "Падение пациента",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 дня назад
  },
  {
    id: "evt_2", // ЭТО СОБЫТИЕ БУДЕТ СВЯЗАНО С ЗАЯВКОЙ req_3
    code: "INC-002",
    categoryId: "equipment",
    typeId: "failure",
    description:
      "Остановка работы МРТ аппарата Siemens. Ошибка системы охлаждения. Пациент не пострадал, процедура прервана.",
    status: "in_work",
    author: "Рентгенолог Смирнов",
    categoryName: "Медицинское оборудование",
    typeName: "Сбой в работе / Поломка",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 часа назад
  },
  {
    id: "evt_3",
    code: "INC-003",
    categoryId: "medication",
    typeId: "wrong_dose",
    status: "created",
    author: "Иванов И.И.",
    categoryName: "Лекарственная безопасность",
    typeName: "Введение неверной дозировки",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 мин назад
  },
  {
    id: "evt_4",
    code: "INC-004",
    categoryId: "security",
    typeId: "disorder",
    description:
      "Посетитель в состоянии алкогольного опьянения пытался пройти в реанимацию. Вызвана охрана.",
    status: "completed",
    author: "Охрана",
    categoryName: "Физическая безопасность",
    typeName: "Нарушение общественного порядка",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 часов назад
  },
  {
    id: "evt_5",
    code: "INC-005",
    categoryId: "safety",
    typeId: "identification",
    description: "Перепутали анализы пациентов однофамильцев.",
    status: "investigation",
    author: "Лаборант Сидорова",
    categoryName: "Безопасность пациента",
    typeName: "Ошибка идентификации",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 дней назад
  },
];

// --- REQUESTS (ЗАЯВКИ) ---
export let requestsDb: ServiceRequest[] = [
  {
    id: "req_1",
    number: 1024,
    type: "it_equip",
    responsibleDept: "Отдел ИТ и связи",
    priority: "normal",
    status: "completed",
    description:
      "Не работает принтер Kyocera в ординаторской. Пишет 'нет тонера', хотя картридж новый.",
    location: "Кабинет 305 (Ординаторская)",
    authorName: "Иванов И.И.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    // --- СВЯЗАННАЯ ЗАЯВКА ---
    id: "req_3",
    number: 1026,
    type: "med_equip",
    responsibleDept: "Служба АХО (Гл. Инженер)",
    priority: "critical",
    status: "purchase", // Ждем закупки запчасти
    description:
      "Ремонт системы охлаждения МРТ. Требуется замена компрессора. Заявка создана на основе инцидента.",
    location: "Кабинет МРТ (101)",
    authorName: "Смирнов А.В.",
    linkedEventId: "evt_2", // <--- СВЯЗЬ С ИНЦИДЕНТОМ
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
  },
  {
    id: "req_5",
    number: 1028,
    type: "it_equip",
    responsibleDept: "Отдел ИТ и связи",
    priority: "normal",
    status: "created",
    description: "Не открывается МИС 'Инфоклиника' у постовой медсестры.",
    location: "Пост №1",
    authorName: "Сидорова Е.В.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// --- ANNOUNCEMENTS (Объявления) ---
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Плановое отключение воды",
    content:
      "Внимание! 20.01.2026 с 10:00 до 14:00 будет отключена горячая вода в корпусе Б в связи с ремонтными работами.",
    priority: "high",
    date: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Вакцинация сотрудников",
    content:
      "Началась ежегодная вакцинация от гриппа. Просьба всем сотрудникам подойти в 105 кабинет до конца недели.",
    priority: "normal",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// --- NOTIFICATIONS (Уведомления) ---
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Новая заявка #1028",
    desc: "Не открывается МИС 'Инфоклиника'",
    time: "5 мин назад",
    date: "Сегодня",
    type: "info",
    read: false,
  },
  {
    id: 2,
    title: "Критический инцидент INC-002",
    desc: "Остановка работы МРТ. Требуется реакция.",
    time: "4 часа назад",
    date: "Сегодня",
    type: "error", // Важное уведомление
    read: false,
  },
  {
    id: 3,
    title: "Заявка #1024 выполнена",
    desc: "Ремонт принтера завершен. Подтвердите выполнение.",
    time: "Вчера",
    date: "Вчера",
    type: "success",
    read: true,
  },
];

// --- STATS (Статистика) ---
export const MOCK_STATS: DashboardStats = {
  kpi: {
    totalRequests: 2150,
    activeRequests: 4, // req_2, req_3, req_4, req_5
    totalEvents: 342,
    criticalEvents: 1, // evt_2 (активный критический)
  },
  charts: {
    requestsByStatus: [
      { name: "Новые", value: 12 },
      { name: "В работе", value: 28 },
      { name: "Ожидание", value: 5 },
      { name: "Завершены", value: 150 },
    ],
    requestsByCategory: [
      { name: "ИТ и Связь", value: 450 },
      { name: "АХО (Ремонт)", value: 620 },
      { name: "Медоборудование", value: 130 },
      { name: "Снабжение", value: 200 },
    ],
    requestsByPriority: [
      { name: "Низкий", value: 300 },
      { name: "Средний", value: 900 },
      { name: "Высокий", value: 150 },
      { name: "Критический", value: 50 },
    ],
    eventsBySeverity: [
      { name: "Легкий", value: 120 },
      { name: "Средний", value: 45 },
      { name: "Тяжелый", value: 15 },
      { name: "Критический", value: 5 },
    ],
    eventsByCategory: [
      { name: "Безопасность", value: 80 },
      { name: "Лекарства", value: 30 },
      { name: "Оборудование", value: 45 },
      { name: "ИСМП", value: 10 },
    ],
    yearlyTrend: [
      { name: "Янв", requests: 120 },
      { name: "Фев", requests: 135 },
      { name: "Мар", requests: 110 },
      { name: "Апр", requests: 150 },
      { name: "Май", requests: 180 },
      { name: "Июн", requests: 160 },
    ],
  },
  performance: {
    closedOnTime: "94.5%",
    avgReactionTime: "1.8 ч",
    bestDepartment: "Отдел ИТ",
  },
};

// --- CLASSIFIER (Справочник категорий НС) ---
export const CLASSIFIER: Category[] = [
  {
    id: "safety",
    name: "Безопасность пациента",
    types: [
      { id: "fall_patient", name: "Падение пациента" },
      { id: "identification", name: "Ошибка идентификации личности" },
      { id: "transfusion", name: "Осложнение при переливании крови" },
      { id: "surgery_error", name: "Хирургическая ошибка / Не та сторона" },
    ],
  },
  {
    id: "medication",
    name: "Лекарственная безопасность",
    types: [
      { id: "wrong_drug", name: "Введение неверного лекарства" },
      { id: "wrong_dose", name: "Введение неверной дозировки" },
      { id: "allergy", name: "Аллергическая реакция (неизвестная ранее)" },
      { id: "storage", name: "Нарушение условий хранения" },
    ],
  },
  {
    id: "equipment",
    name: "Медицинское оборудование",
    types: [
      { id: "failure", name: "Сбой в работе / Поломка" },
      { id: "absence", name: "Отсутствие необходимого расходного материала" },
      { id: "settings", name: "Неверные настройки оборудования" },
    ],
  },
  {
    id: "security",
    name: "Физическая безопасность / Охрана",
    types: [
      { id: "access", name: "Несанкционированный доступ" },
      { id: "theft", name: "Кража имущества" },
      { id: "disorder", name: "Нарушение общественного порядка" },
      { id: "aggression", name: "Агрессия со стороны пациента/родственников" },
    ],
  },
  {
    id: "infection",
    name: "Эпидемиологическая безопасность",
    types: [
      { id: "ismp", name: "ИСМП (Внутрибольничная инфекция)" },
      { id: "needlestick", name: "Укол иглой / Порез сотрудника" },
      { id: "sanitary", name: "Нарушение санэпидрежима" },
    ],
  },
];
