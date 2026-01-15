import { EventSeverity, EventStatus, Priority, UserRole } from "./types";

export const ROLE_NAMES: Record<UserRole, string> = {
  admin_system: "Системный администратор",
  admin_org: "Администратор организации",
  head_clinic: "Главный врач",
  head_dept: "Зав. отделением",
  dispatcher_ns: "Диспетчер НС",
  dispatcher_req: "Диспетчер АХО",
  manager_ns: "Ответственный за НС",
  manager_req: "Ответственный за заявки",
  worker: "Сотрудник",
  guest: "Гость",
};

export const SERVICE_TYPE_CONFIG: Record<
  string,
  { label: string; dept: string }
> = {
  med_equip: {
    label: "Медицинское оборудование",
    dept: "Служба главного инженера",
  },
  it_equip: {
    label: "Компьютерное оборудование",
    dept: "Отдел ИТ и ИБ",
  },
  energy: {
    label: "Энергетическая и лифтовая служба",
    dept: "Энергетическая и лифтовая служба",
  },
  ventilation: {
    label: "Вентиляция",
    dept: "Служба вентиляции и газоснабжения",
  },
  plumbing: {
    label: "Сантехники",
    dept: "Служба текущего ремонта и обслуживания водоканализационной и отопительной системы",
  },
  housekeeping: {
    label: "Хозяйственная служба",
    dept: "Хозяйственная служба",
  },
  territory: {
    label: "Служба содержания территории",
    dept: "Служба текущего содержания и благоустройства территории",
  },
  buildings: {
    label: "Служба эксплуатации зданий и сооружений",
    dept: "Служба эксплуатации зданий и сооружений",
  },
  control: {
    label: "Контрольно-инспекционный отдел",
    dept: "Контрольно-инспекционный отдел",
  },
};

export const STATUS_MAP: Record<string, string> = {
  created: "Принята",
  processed: "Обработана",
  in_work: "В работе",
  purchase: "Закупка запчастей",
  completed: "Выполнена",
  refused: "Отказ",
  cancelled: "Отмена",
};

export const PRIORITY_MAP: Record<Priority, string> = {
  normal: "Обычный",
  high: "Срочный",
  critical: "Критический",
};

export const EVENT_STATUS_MAP: Record<EventStatus | string, string> = {
  created: "Принята",
  in_work: "В работе",
  investigation: "Расследование",
  measures: "Меры приняты",
  check: "Проверка",
  completed: "Завершено",
  closed: "Закрыто",
};

export const EVENT_SEVERITY_MAP: Record<EventSeverity | string, string> = {
  near_miss: "Потенциальный риск",
  minor: "Легкий вред",
  moderate: "Средний вред",
  severe: "Тяжкий вред",
  critical: "Критический",
  low: "Низкий",
};
