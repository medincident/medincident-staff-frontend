// Типы данных
export type Department = {
  id: string;
  name: string;
};

export type Clinic = {
  id: string;
  name: string;
  address: string;
  departments: Department[];
};

export type User = {
  id: string;
  name: string;
  role: "Гость" | "Регистратор" | "Ответственный" | "Администратор"; // Добавили роль "Гость"
  clinicId: string | null; // Теперь может быть null
  departmentId: string | null; // Теперь может быть null
  login: string;
  status: "active" | "pending"; // Статус аккаунта
};

// ... (INITIAL_CLINICS оставляем как были) ...

export const INITIAL_USERS: User[] = [
  {
    id: "u_1",
    name: "Иванов И.И.",
    role: "Регистратор",
    clinicId: "cl_1",
    departmentId: "dep_1",
    login: "ivanov",
    status: "active",
  },
  {
    id: "u_2",
    name: "Петрова А.В.",
    role: "Ответственный",
    clinicId: "cl_1",
    departmentId: "dep_2",
    login: "petrova",
    status: "active",
  },
  {
    id: "u_3",
    name: "Админов А.А.",
    role: "Администратор",
    clinicId: "cl_1",
    departmentId: "dep_3",
    login: "admin",
    status: "active",
  },
  // НОВЫЙ ПОЛЬЗОВАТЕЛЬ (только что вошел через Telegram)
  {
    id: "u_new",
    name: "Sergey (Telegram)",
    role: "Гость",
    clinicId: null,
    departmentId: null,
    login: "sergey_tg_123",
    status: "pending",
  },
];

// Начальные данные (Клиники и Отделения)
export const INITIAL_CLINICS: Clinic[] = [
  {
    id: "cl_1",
    name: "ГКБ №1 им. Пирогова",
    address: "ул. Ленина, 45",
    departments: [
      { id: "dep_1", name: "Терапевтическое отделение" },
      { id: "dep_2", name: "Хирургия" },
      { id: "dep_3", name: "Приемный покой" },
    ],
  },
  {
    id: "cl_2",
    name: "Детская поликлиника №5",
    address: "пр. Мира, 12",
    departments: [
      { id: "dep_4", name: "Педиатрия" },
      { id: "dep_5", name: "Травматология" },
    ],
  },
];
