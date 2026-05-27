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
import { OrgStructureQueryService } from "@/lib/api-generated";

// Активная организация: employments для сотрудника, все орги для sysadmin.

const STORAGE_KEY = "activeOrgId";

export interface ActiveOrg {
  id: string;
  name?: string;
}

interface ActiveOrgContextValue {
  orgId: string | null;
  setOrgId: (id: string | null) => void;
  isResolving: boolean;
  availableOrgs: ActiveOrg[];
  // sysadmin без employments → isUnscoped: true.
  isUnscoped: boolean;
}

const Ctx = createContext<ActiveOrgContextValue | null>(null);

export function ActiveOrgProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [orgId, setOrgIdState] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [availableOrgs, setAvailableOrgs] = useState<ActiveOrg[]>([]);
  const [isUnscoped, setIsUnscoped] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setIsResolving(false);
      setOrgIdState(null);
      setAvailableOrgs([]);
      setIsUnscoped(false);
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

        const myOrgs: ActiveOrg[] = employees
          .filter((e) => e.organizationId)
          .map((e) => ({
            id: e.organizationId as string,
            name: e.organizationName,
          }));

        let orgs = myOrgs;
        const unscoped = myOrgs.length === 0;
        if (unscoped) {
          // Sysadmin без employments — даём весь список орг, чтобы он
          // мог переключаться между ними.
          try {
            const res = await OrgStructureQueryService.orgStructureQueryListOrganizations(100);
            if (cancelled) return;
            const items = ((res as any)?.items ?? []) as Array<{ id?: string; name?: string }>;
            orgs = items
              .filter((o) => o.id)
              .map((o) => ({ id: o.id as string, name: o.name }));
          } catch {
            orgs = [];
          }
        }

        if (cancelled) return;
        setAvailableOrgs(orgs);
        setIsUnscoped(unscoped);

        const stored =
          typeof window !== "undefined"
            ? sessionStorage.getItem(STORAGE_KEY)
            : null;

        if (stored && orgs.some((o) => o.id === stored)) {
          setOrgIdState(stored);
        } else if (orgs.length > 0) {
          setOrgIdState(orgs[0].id);
        }
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  const setOrgId = (id: string | null) => {
    // Разрешаем выбирать только из доступного списка.
    if (id && !availableOrgs.some((o) => o.id === id)) return;

    setOrgIdState(id);
    if (typeof window !== "undefined") {
      if (id) sessionStorage.setItem(STORAGE_KEY, id);
      else sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <Ctx.Provider value={{ orgId, setOrgId, isResolving, availableOrgs, isUnscoped }}>
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
