"use client";

import { useEffect, useState } from "react";
import { SelfQueryService } from "@/lib/api-generated";

export interface MyDeptRole {
  isDepartmentResponsible: boolean;
}

const EMPTY: MyDeptRole = { isDepartmentResponsible: false };
const CACHE_KEY_PREFIX = "myDeptRole:";

function readCache(deptId: string): MyDeptRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + deptId);
    return raw ? (JSON.parse(raw) as MyDeptRole) : null;
  } catch {
    return null;
  }
}

function writeCache(deptId: string, role: MyDeptRole): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + deptId, JSON.stringify(role));
  } catch {}
}

// Дедуп параллельных запросов (см. use-my-clinic-role): один промис на deptId.
const inflight = new Map<string, Promise<MyDeptRole>>();

function fetchDeptRole(deptId: string): Promise<MyDeptRole> {
  const existing = inflight.get(deptId);
  if (existing) return existing;
  const p = SelfQueryService.selfQueryGetMyDepartmentRole(deptId)
    .then((res) => {
      const next: MyDeptRole = {
        isDepartmentResponsible: !!(res as any)?.isDepartmentResponsible,
      };
      writeCache(deptId, next);
      return next;
    })
    .finally(() => inflight.delete(deptId));
  inflight.set(deptId, p);
  return p;
}

// Возвращает роль текущего юзера в указанном отделении.
// Источник — `GET /v1/me/departments/{id}/role` (medincident-backend#155).
export function useMyDeptRole(deptId: string | null | undefined) {
  const [role, setRole] = useState<MyDeptRole>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!deptId) {
      setRole(EMPTY);
      setIsLoading(false);
      return;
    }

    const cached = readCache(deptId);
    if (cached) {
      setRole(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    fetchDeptRole(deptId)
      .then((next) => {
        if (!cancelled) setRole(next);
      })
      .catch(() => {
        if (!cancelled) setRole(EMPTY);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [deptId]);

  return { role, isLoading };
}
