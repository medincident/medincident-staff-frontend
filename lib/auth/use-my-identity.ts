"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SelfQueryService } from "@/lib/api-generated";

interface MyIdentity {
  isSystemAdmin: boolean;
}

const CACHE_KEY_PREFIX = "myIdentity:";

function readCache(zitadelUserId: string): MyIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + zitadelUserId);
    return raw ? (JSON.parse(raw) as MyIdentity) : null;
  } catch {
    return null;
  }
}

function writeCache(zitadelUserId: string, identity: MyIdentity): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + zitadelUserId, JSON.stringify(identity));
  } catch {}
}

// Дедуп параллельных GET /v1/me: Dashboard/Profile/RolesGuard/usePermissions
// на холодном кеше иначе шлют его одновременно. Один промис на userId.
const inflight = new Map<string, Promise<MyIdentity>>();

function fetchIdentity(userId: string): Promise<MyIdentity> {
  const existing = inflight.get(userId);
  if (existing) return existing;
  const p = SelfQueryService.selfQueryGetMyIdentity()
    .then((res) => {
      const next: MyIdentity = { isSystemAdmin: !!(res as any)?.isSystemAdmin };
      writeCache(userId, next);
      return next;
    })
    .finally(() => inflight.delete(userId));
  inflight.set(userId, p);
  return p;
}

export function clearMyIdentityCache(): void {
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(CACHE_KEY_PREFIX)) sessionStorage.removeItem(key);
  }
}

// Возвращает identity-флаги текущего юзера (пока только `isSystemAdmin`).
// Источник — `GET /v1/me` (medincident-backend#155). Кэшируется в session.
export function useMyIdentity() {
  const { data: session, status } = useSession();
  const [identity, setIdentity] = useState<MyIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setIdentity(null);
      setIsLoading(false);
      return;
    }
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const cached = readCache(userId);
    if (cached) {
      setIdentity(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    fetchIdentity(userId)
      .then((next) => {
        if (!cancelled) setIdentity(next);
      })
      .catch(() => {
        if (!cancelled) setIdentity(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  return { identity, isLoading };
}
