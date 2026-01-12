// --- ТИПЫ ДАННЫХ ---

export type UserRole =
  | "admin_system" // Системный администратор
  | "admin_org" // Администратор организации
  | "head_clinic" // Главный врач / Директор
  | "head_dept" // Заведующий отделением
  | "dispatcher_ns" // Диспетчер НС (Безопасность)
  | "dispatcher_req" // Диспетчер АХО (Заявки)
  | "worker" // Врач / Медсестра / Сотрудник
  | "guest"; // Неподтвержденный пользователь

export type UserStatus = "active" | "blocked" | "pending";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  position: string; // Должность для отображения (напр. "Хирург")
  login: string;
  status: UserStatus;
  clinicId?: string; // Привязка к клинике (необязательно)
  departmentId?: string; // Привязка к отделению (необязательно)
}

export interface Department {
  id: string;
  name: string;
  headId?: string; // ID заведующего отделением
  headName?: string; // Имя для удобства отображения
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  departments: Department[];
  headId?: string; // ID главврача
  headName?: string; // Имя для удобства отображения
}

// --- СПИСОК ПОЛЬЗОВАТЕЛЕЙ (MOCK_USERS) ---
export const MOCK_USERS: User[] = [
  // 1. РУКОВОДСТВО (Главврачи)
  {
    id: "u_1",
    name: "Смирнов Алексей Владимирович",
    role: "head_clinic",
    email: "smirnov@hospital.ru",
    position: "Главный врач",
    login: "smirnov_av",
    status: "active",
    clinicId: "cl_1",
  },
  {
    id: "u_2",
    name: "Краснова Наталья Юрьевна",
    role: "head_clinic",
    email: "krasnova@hospital.ru",
    position: "Директор филиала",
    login: "krasnova_ny",
    status: "active",
    clinicId: "cl_2",
  },

  // 2. ЗАВЕДУЮЩИЕ ОТДЕЛЕНИЯМИ
  {
    id: "u_3",
    name: "Петров Сергей Иванович",
    role: "head_dept",
    email: "petrov@hospital.ru",
    position: "Зав. хирургией",
    login: "petrov_si",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_2",
  },
  {
    id: "u_4",
    name: "Иванова Мария Сергеевна",
    role: "head_dept",
    email: "ivanova@hospital.ru",
    position: "Зав. терапией",
    login: "ivanova_ms",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_3",
  },
  {
    id: "u_5",
    name: "Сидоров Дмитрий Павлович",
    role: "head_dept",
    email: "sidorov@hospital.ru",
    position: "Зав. кардиологией",
    login: "sidorov_dp",
    status: "active",
    clinicId: "cl_2",
    departmentId: "dep_5",
  },

  // 3. ВРАЧИ И ПЕРСОНАЛ
  {
    id: "u_6",
    name: "Волков Андрей Петрович",
    role: "worker",
    email: "volkov@hospital.ru",
    position: "Хирург",
    login: "volkov_ap",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_2",
  },
  {
    id: "u_7",
    name: "Соколова Елена Дмитриевна",
    role: "worker",
    email: "sokolova@hospital.ru",
    position: "Терапевт",
    login: "sokolova_ed",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_3",
  },
  {
    id: "u_8",
    name: "Кузнецов Павел Игоревич",
    role: "worker",
    email: "kuznetsov@hospital.ru",
    position: "Анестезиолог",
    login: "kuznetsov_pi",
    status: "active",
    clinicId: "cl_1",
    departmentId: "dep_2",
  },

  // 4. АДМИНИСТРАТОРЫ И ДИСПЕТЧЕРЫ
  {
    id: "u_9",
    name: "Администратор Системы",
    role: "admin_system",
    email: "admin@sys.ru",
    position: "IT Отдел",
    login: "root_admin",
    status: "active",
  },
  {
    id: "u_10",
    name: "Диспетчер АХО",
    role: "dispatcher_req",
    email: "disp@aho.ru",
    position: "Служба эксплуатации",
    login: "disp_aho",
    status: "active",
  },

  // 5. НОВЫЕ ПОЛЬЗОВАТЕЛИ (Гости)
  {
    id: "u_new_1",
    name: "Sergey (Telegram)",
    role: "guest",
    email: "no-email@tg.com",
    position: "Не определена",
    login: "sergey_tg_123",
    status: "pending", // Ожидает активации
  },
];

// --- НАЧАЛЬНЫЕ ДАННЫЕ КЛИНИК (INITIAL_CLINICS) ---
export const INITIAL_CLINICS: Clinic[] = [
  {
    id: "cl_1",
    name: "ГКБ №1 им. Пирогова",
    address: "Ленинский проспект, 8",
    headId: "u_1", // Смирнов А.В.
    headName: "Смирнов Алексей Владимирович",
    departments: [
      {
        id: "dep_1",
        name: "Приемное отделение",
        // Нет руководителя
      },
      {
        id: "dep_2",
        name: "Хирургия",
        headId: "u_3", // Петров С.И.
        headName: "Петров Сергей Иванович",
      },
      {
        id: "dep_3",
        name: "Терапия",
        headId: "u_4", // Иванова М.С.
        headName: "Иванова Мария Сергеевна",
      },
    ],
  },
  {
    id: "cl_2",
    name: "Филиал №2 (Поликлиника)",
    address: "ул. Вавилова, 14",
    headId: "u_2", // Краснова Н.Ю.
    headName: "Краснова Наталья Юрьевна",
    departments: [
      {
        id: "dep_4",
        name: "Регистратура",
      },
      {
        id: "dep_5",
        name: "Кардиология",
        headId: "u_5", // Сидоров Д.П.
        headName: "Сидоров Дмитрий Павлович",
      },
    ],
  },
  {
    id: "cl_3",
    name: "Детский корпус",
    address: "ул. Строителей, 5",
    departments: [], // Пустой корпус
  },
];
