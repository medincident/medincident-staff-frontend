"use client";

import { ReactNode } from "react";
import { usePermissions, type PermissionKey } from "@/lib/auth/use-permissions";

interface Props {
  /**
   * Любой из перечисленных permission'ов (any-of).
   * Можно передать строку или массив. Если массив — нужен хотя бы один true.
   */
  can?: PermissionKey | PermissionKey[];
  /**
   * Все перечисленные permission'ы (all-of). Применяется поверх `can`.
   * Если переданы оба — должны выполниться обе проверки.
   */
  all?: PermissionKey[];
  /** Показывать пока permissions грузятся. По умолчанию ничего. */
  loadingFallback?: ReactNode;
  /** Что показать, если прав нет. По умолчанию ничего. */
  fallback?: ReactNode;
  children: ReactNode;
}

// Универсальный гейт для скрытия UI в зависимости от роли.
// Не используется для защиты маршрутов — для этого есть useRequirePermission
// (рендерит редирект). Здесь — просто условный рендер фрагмента.
export function PermissionGate({
  can,
  all,
  loadingFallback = null,
  fallback = null,
  children,
}: Props) {
  const perms = usePermissions();
  if (perms.isLoading) return <>{loadingFallback}</>;

  let allowed = true;
  if (can) {
    const keys = Array.isArray(can) ? can : [can];
    allowed = keys.some((k) => !!perms[k]);
  }
  if (allowed && all && all.length > 0) {
    allowed = all.every((k) => !!perms[k]);
  }
  return allowed ? <>{children}</> : <>{fallback}</>;
}
