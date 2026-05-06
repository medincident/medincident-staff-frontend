"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { getMyEmployees } from "./get-my-employee";

// Активная организация для админ-страниц и дашборда.
//   - 0 employee-карточек → sysadmin: picker со всеми орг.
//   - 1 карточка → locked, переключать нельзя.
//   - 2+ → мульти-орг: picker ограничен `myOrgs`.

const STORAGE_KEY = "activeOrgId";

export interface ActiveOrg {
  id: string;
  name?: string;
}

interface ActiveOrgContextValue {
  orgId: string | null;
  setOrgId: (id: string | null) => void;
  isResolving: boolean;
  isLocked: boolean;
  myOrgs: ActiveOrg[];
}

const Ctx = createContext<ActiveOrgContextValue | null>(null);

export function ActiveOrgProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [orgId, setOrgIdState] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isResolving, setIsResolving] = useState(true);
  const [myOrgs, setMyOrgs] = useState<ActiveOrg[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setIsResolving(false);
      setOrgIdState(null);
      setIsLocked(false);
      setMyOrgs([]);
      return;
    }
    const userId = (session?.user as any)?.id;
    if (!userId) {
      setIsResolving(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const employees = await getMyEmployees(userId);
        if (cancelled) return;

        const orgs: ActiveOrg[] = employees
          .filter((e) => e.organizationId)
          .map((e) => ({
            id: e.organizationId as string,
            name: e.organizationName,
          }));

        setMyOrgs(orgs);

        if (orgs.length === 1) {
          setIsLocked(true);
          setOrgIdState(orgs[0].id);
          return;
        }

        setIsLocked(false);
        const stored =
          typeof window !== "undefined"
            ? sessionStorage.getItem(STORAGE_KEY)
            : null;

        if (orgs.length >= 2) {
          if (stored && orgs.some((o) => o.id === stored)) {
            setOrgIdState(stored);
          } else {
            setOrgIdState(orgs[0].id);
          }
          return;
        }

        if (stored) setOrgIdState(stored);
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  const setOrgId = (id: string | null) => {
    if (isLocked) return;
    if (myOrgs.length > 0 && id && !myOrgs.some((o) => o.id === id)) return;

    setOrgIdState(id);
    if (typeof window !== "undefined") {
      if (id) sessionStorage.setItem(STORAGE_KEY, id);
      else sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <Ctx.Provider value={{ orgId, setOrgId, isResolving, isLocked, myOrgs }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActiveOrgId(): ActiveOrgContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useActiveOrgId must be used within ActiveOrgProvider");
  }
  return ctx;
}
