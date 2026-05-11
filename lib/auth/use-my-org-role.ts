"use client";

import { useEffect, useState } from "react";
import { SelfQueryService } from "@/lib/api-generated";
import { useActiveOrgId } from "./active-org-context";

export interface MyOrgRole {
  isOrgAdmin: boolean;
  isOrgHead: boolean;
  isOrgDispatcher: boolean;
}

const EMPTY: MyOrgRole = {
  isOrgAdmin: false,
  isOrgHead: false,
  isOrgDispatcher: false,
};

const CACHE_KEY_PREFIX = "myOrgRole:";

function readCache(orgId: string): MyOrgRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + orgId);
    return raw ? (JSON.parse(raw) as MyOrgRole) : null;
  } catch {
    return null;
  }
}

function writeCache(orgId: string, role: MyOrgRole): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + orgId, JSON.stringify(role));
  } catch {}
}

// Возвращает роли текущего юзера в АКТИВНОЙ организации.
// Источник — `GET /v1/me/organizations/{id}/role` (medincident-backend#155).
export function useMyOrgRole() {
  const { orgId, isResolving } = useActiveOrgId();
  const [role, setRole] = useState<MyOrgRole>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isResolving) return;
    if (!orgId) {
      setRole(EMPTY);
      setIsLoading(false);
      return;
    }

    const cached = readCache(orgId);
    if (cached) {
      setRole(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    SelfQueryService.selfQueryGetMyOrganizationRole(orgId)
      .then((res) => {
        if (cancelled) return;
        const next: MyOrgRole = {
          isOrgAdmin: !!(res as any)?.isOrgAdmin,
          isOrgHead: !!(res as any)?.isOrgHead,
          isOrgDispatcher: !!(res as any)?.isOrgDispatcher,
        };
        writeCache(orgId, next);
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
  }, [orgId, isResolving]);

  return { role, isLoading };
}
