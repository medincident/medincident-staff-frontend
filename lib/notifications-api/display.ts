// Маппинг типа уведомления (из бэка) на отображаемые данные UI:
// человеко-читаемое название, intent-цвет (warning/info/success/error/muted),
// иконка и URL-перехода на сущность.
//
// Бэк отдаёт `entityType` (incident | service_request | vacation | employee | …)
// и `entityId`. Для перехода используем главные маршруты фронта.

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Plane,
  UserPlus,
  UserMinus,
  Shield,
  ShieldAlert,
  Briefcase,
  ArrowLeftRight,
  Mail,
  LogIn,
  ListChecks,
} from "lucide-react";
import {
  v1NotificationType,
  type v1Notification,
} from "@/lib/notifications-api";

type Intent = "info" | "warning" | "success" | "error" | "muted";

export interface NotificationDisplay {
  title: string;
  intent: Intent;
  icon: LucideIcon;
  href?: string;
}

function entityHref(entityType?: string, entityId?: string): string | undefined {
  if (!entityType || !entityId) return undefined;
  switch (entityType) {
    case "incident":
      return `/events/${entityId}`;
    case "service_request":
      return `/requests/${entityId}`;
    default:
      return undefined;
  }
}

export function displayNotification(n: v1Notification): NotificationDisplay {
  const href = entityHref(n.entityType, n.entityId);
  switch (n.type) {
    // ---- Incident ----
    case v1NotificationType.NOTIFICATION_TYPE_INCIDENT_CREATED:
      return { title: "Новое нежелательное событие", intent: "warning", icon: AlertTriangle, href };
    case v1NotificationType.NOTIFICATION_TYPE_INCIDENT_STATUS_CHANGED:
      return { title: "Статус НС изменён", intent: "info", icon: ListChecks, href };
    case v1NotificationType.NOTIFICATION_TYPE_INCIDENT_PRIORITY_CHANGED:
      return { title: "Приоритет НС изменён", intent: "info", icon: AlertTriangle, href };
    case v1NotificationType.NOTIFICATION_TYPE_INCIDENT_DESCRIPTION_UPDATED:
      return { title: "Описание НС обновлено", intent: "muted", icon: AlertTriangle, href };

    // ---- Service request ----
    case v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_CREATED:
      return { title: "Новая заявка на обслуживание", intent: "info", icon: Wrench, href };
    case v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_STATUS_CHANGED:
      return { title: "Статус заявки изменён", intent: "info", icon: ListChecks, href };
    case v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_EXECUTOR_ASSIGNED:
      return { title: "Назначен исполнитель", intent: "info", icon: Briefcase, href };
    case v1NotificationType.NOTIFICATION_TYPE_SERVICE_REQUEST_EXECUTOR_REMOVED:
      return { title: "Исполнитель снят", intent: "muted", icon: Briefcase, href };

    // ---- Vacation ----
    case v1NotificationType.NOTIFICATION_TYPE_VACATION_SCHEDULED:
      return { title: "Запланирован отпуск", intent: "info", icon: Plane };
    case v1NotificationType.NOTIFICATION_TYPE_VACATION_STARTED:
      return { title: "Отпуск начался", intent: "info", icon: Plane };
    case v1NotificationType.NOTIFICATION_TYPE_VACATION_ENDED:
      return { title: "Отпуск завершён", intent: "success", icon: Plane };
    case v1NotificationType.NOTIFICATION_TYPE_VACATION_CANCELLED:
      return { title: "Отпуск отменён", intent: "muted", icon: Plane };
    case v1NotificationType.NOTIFICATION_TYPE_VACATION_END_DATE_CHANGED:
      return { title: "Дата окончания отпуска изменена", intent: "info", icon: Plane };

    // ---- Employee ----
    case v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_HIRED:
      return { title: "Принят на работу", intent: "success", icon: UserPlus };
    case v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_TERMINATED:
      return { title: "Уволен", intent: "warning", icon: UserMinus };
    case v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_DEPARTMENT_CHANGED:
      return { title: "Перевод в другое отделение", intent: "info", icon: ArrowLeftRight };
    case v1NotificationType.NOTIFICATION_TYPE_EMPLOYEE_POSITION_CHANGED:
      return { title: "Изменилась должность", intent: "info", icon: Briefcase };

    // ---- Role ----
    case v1NotificationType.NOTIFICATION_TYPE_ROLE_ASSIGNED:
      return { title: "Назначена роль", intent: "success", icon: Shield };
    case v1NotificationType.NOTIFICATION_TYPE_ROLE_REVOKED:
      return { title: "Роль отозвана", intent: "muted", icon: Shield };

    // ---- System admin ----
    case v1NotificationType.NOTIFICATION_TYPE_SYSTEM_ADMIN_GRANTED:
      return { title: "Выданы права системного администратора", intent: "warning", icon: ShieldAlert };
    case v1NotificationType.NOTIFICATION_TYPE_SYSTEM_ADMIN_REVOKED:
      return { title: "Права системного администратора отозваны", intent: "muted", icon: ShieldAlert };

    // ---- Security ----
    case v1NotificationType.NOTIFICATION_TYPE_SECURITY_NEW_LOGIN:
      return { title: "Вход в систему с нового устройства", intent: "warning", icon: LogIn };
    case v1NotificationType.NOTIFICATION_TYPE_SECURITY_EMAIL_CHANGED:
      return { title: "Изменён e-mail аккаунта", intent: "warning", icon: Mail };

    default:
      return { title: "Уведомление", intent: "info", icon: CheckCircle2, href };
  }
}

// Описание из metadata. На бэке metadata это google.protobuf.Struct, на
// клиенте приходит произвольный объект. Берём чаще всего встречаемые ключи
// (description, message, title) или собираем строкой из ключевых полей.
export function notificationDescription(n: v1Notification): string {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const desc =
    (typeof meta.description === "string" && meta.description) ||
    (typeof meta.message === "string" && meta.message) ||
    (typeof meta.title === "string" && meta.title);
  if (desc) return desc;
  // Фолбэк — компактно показываем тип сущности.
  if (n.entityType && n.entityId) {
    return `${n.entityType} #${n.entityId.substring(0, 8)}`;
  }
  return "";
}
