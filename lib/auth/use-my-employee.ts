"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getMyEmployeeInOrg, getMyEmployee } from "./get-my-employee";
import { useActiveOrgId } from "./active-org-context";
import type { v1EmployeeCardView } from "@/lib/api-generated";

// Возвращает employee-карточку для активной организации.
// Если активной нет (sysadmin без выбора) — fallback на любую найденную,
// чтобы шапка / профиль могли показать ФИО.
export function useMyEmployee() {
  const { data: session, status } = useSession();
  const { orgId, isResolving: isOrgResolving } = useActiveOrgId();
  const [employee, setEmployee] = useState<v1EmployeeCardView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading" || isOrgResolving) return;
    if (status !== "authenticated") {
      setEmployee(null);
      setIsLoading(false);
      return;
    }
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    const promise = orgId
      ? getMyEmployeeInOrg(userId, orgId)
      : getMyEmployee(userId);

    promise
      .then((emp) => {
        if (!cancelled) setEmployee(emp);
      })
      .catch(() => {
        if (!cancelled) setEmployee(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status, orgId, isOrgResolving]);

  return { employee, isLoading };
}
