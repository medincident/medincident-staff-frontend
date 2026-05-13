// Парсер ошибок бэка под формат `v1ErrorResponse`:
//   { code: string, message: string, details?: { violations: [...] } }
// (см. medincident.swagger.json и docs/services бэка)
//
// `code` — машинно-читаемая строка, например "validation_failed",
// "employee_not_found", "permission_denied", "zitadel_user_not_found".
// `details.violations` присутствуют только при code = "validation_failed".

import type { ApiError } from "@/lib/api-generated";

export interface FieldViolation {
  field: string;
  rule: string;
  message?: string;
  param?: string;
}

export interface BackendErrorPayload {
  code: string;
  message: string;
  violations: FieldViolation[];
  status?: number;
}

// Сборник дружелюбных русских заголовков для часто встречающихся code'ов.
// Если code не в словаре — fallback на пришедший с бэка `message`.
const CODE_TITLES: Record<string, string> = {
  validation_failed: "Проверьте поля",
  permission_denied: "Недостаточно прав",
  unauthenticated: "Требуется вход",
  not_found: "Не найдено",

  employee_not_found: "Сотрудник не найден",
  employee_already_hired: "Сотрудник уже нанят",
  zitadel_user_not_found: "Пользователь не найден в Zitadel",
  zitadel_verify_failed: "Сервер не смог проверить пользователя",

  organization_not_found: "Организация не найдена",
  clinic_not_found: "Клиника не найдена",
  department_not_found: "Отделение не найдено",

  incident_not_found: "Инцидент не найден",
  incident_category_not_found: "Категория не найдена",
  incident_category_inactive: "Категория неактивна",
  incident_type_not_found: "Тип инцидента не найден",
  incident_occurred_at_invalid: "Некорректная дата возникновения",
  incident_occurred_at_future: "Дата не может быть в будущем",
  incident_occurred_at_too_old: "Можно регистрировать события не старше 48 часов",

  service_request_not_found: "Заявка не найдена",
  request_type_not_found: "Тип заявки не найден",

  announcement_not_found: "Объявление не найдено",
};

const RULE_LABELS: Record<string, string> = {
  required: "обязательное поле",
  uuid: "должно быть UUID",
  min: "слишком короткое",
  max: "слишком длинное",
  no_extra_ws: "лишние пробелы",
  oneof: "недопустимое значение",
  email: "некорректный e-mail",
  url: "некорректный URL",
};

// Читает axios-error / fetch-error / ApiError из сгенерированного клиента
// и приводит к общему виду. Если форма не та — отдаёт null.
export function parseBackendError(e: unknown): BackendErrorPayload | null {
  if (!e || typeof e !== "object") return null;

  const err = e as ApiError & {
    response?: { data?: any; status?: number };
    body?: any;
    status?: number;
  };

  // axios — err.response?.data; openapi-typescript-codegen — err.body.
  const body = err.body ?? err.response?.data;
  const status = err.status ?? err.response?.status;
  if (!body || typeof body !== "object") {
    return status
      ? { code: "", message: "", violations: [], status }
      : null;
  }

  const code = typeof body.code === "string" ? body.code : "";
  const message = typeof body.message === "string" ? body.message : "";
  const violations: FieldViolation[] = Array.isArray(body.details?.violations)
    ? body.details.violations.map((v: any) => ({
        field: String(v?.field ?? ""),
        rule: String(v?.rule ?? ""),
        message: v?.message ? String(v.message) : undefined,
        param: v?.param ? String(v.param) : undefined,
      }))
    : [];

  return { code, message, violations, status };
}

export function formatViolation(v: FieldViolation): string {
  const fieldName = v.field || "поле";
  const ruleLabel = RULE_LABELS[v.rule] ?? v.rule;
  const param = v.param ? ` (${v.param})` : "";
  return v.message?.trim() ? `${fieldName}: ${v.message}` : `${fieldName}: ${ruleLabel}${param}`;
}

// Заголовок тоста: словарный заголовок по code → сам code (raw машинный) →
// HTTP-статус (если ни code, ни словаря нет) → fallback. Текст из message
// в title не утекает — он живёт в description, иначе обе строки тоста дублируются.
export function errorTitle(payload: BackendErrorPayload | null, fallback = "Ошибка"): string {
  if (!payload) return fallback;
  const dictTitle = CODE_TITLES[payload.code];
  if (dictTitle) return dictTitle;
  if (payload.code) return payload.code;
  if (payload.status) return `Ошибка ${payload.status}`;
  return fallback;
}

// Описание тоста: violations списком (для validation_failed) или сам message.
// Если message пустой — fallback (а не дубль title).
export function errorDescription(
  payload: BackendErrorPayload | null,
  fallback?: string,
): string | undefined {
  if (!payload) return fallback;
  if (payload.violations.length > 0) {
    return payload.violations.map(formatViolation).join(" • ");
  }
  if (payload.message) return payload.message;
  return fallback;
}
