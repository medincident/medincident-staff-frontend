"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions, type PermissionKey } from "./use-permissions";

interface Options {
  /** Куда редиректить, если прав нет. По умолчанию /dashboard. */
  redirectTo?: string;
}

/**
 * Защита страницы по permission'у. Если permissions ещё грузятся —
 * возвращает `{isLoading: true}` (страница может показать skeleton).
 * Если права отсутствуют — делает router.replace на `redirectTo`.
 *
 * Для условного рендера фрагмента используй <PermissionGate />.
 */
export function useRequirePermission(
  perm: PermissionKey | PermissionKey[],
  options: Options = {},
) {
  const router = useRouter();
  const perms = usePermissions();
  const redirectTo = options.redirectTo ?? "/dashboard";

  const keys = Array.isArray(perm) ? perm : [perm];
  const allowed = keys.some((k) => !!perms[k]);

  useEffect(() => {
    if (perms.isLoading) return;
    if (!allowed) router.replace(redirectTo);
  }, [perms.isLoading, allowed, router, redirectTo]);

  return { isLoading: perms.isLoading, allowed };
}
