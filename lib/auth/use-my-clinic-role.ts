"use client";

import { useEffect, useState } from "react";
import { SelfQueryService } from "@/lib/api-generated";

export interface MyClinicRole {
  isClinicHead: boolean;
}

const EMPTY: MyClinicRole = { isClinicHead: false };
const CACHE_KEY_PREFIX = "myClinicRole:";

function readCache(clinicId: string): MyClinicRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + clinicId);
    return raw ? (JSON.parse(raw) as MyClinicRole) : null;
  } catch {
    return null;
  }
}

function writeCache(clinicId: string, role: MyClinicRole): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + clinicId, JSON.stringify(role));
  } catch {}
}

// Возвращает роль текущего юзера в указанной клинике.
// Источник — `GET /v1/me/clinics/{id}/role` (medincident-backend#155).
export function useMyClinicRole(clinicId: string | null | undefined) {
  const [role, setRole] = useState<MyClinicRole>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!clinicId) {
      setRole(EMPTY);
      setIsLoading(false);
      return;
    }

    const cached = readCache(clinicId);
    if (cached) {
      setRole(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    SelfQueryService.selfQueryGetMyClinicRole(clinicId)
      .then((res) => {
        if (cancelled) return;
        const next: MyClinicRole = {
          isClinicHead: !!(res as any)?.isClinicHead,
        };
        writeCache(clinicId, next);
        setRole(next);
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
  }, [clinicId]);

  return { role, isLoading };
}
