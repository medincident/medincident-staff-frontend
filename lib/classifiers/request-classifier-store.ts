"use client";

import { useEffect } from "react";
import { create } from "zustand";

import {
  RequestClassifierQueryService,
  v1RequestType,
} from "@/lib/api-generated";

// Кеш справочника типов заявок (активные) — единый на приложение.
// Раньше список заявок тянул его при каждом маунте. Данные статические
// (меняются только через админку), кешируем по orgId; админка дёргает
// invalidateRequestClassifier() после мутаций.

type OrgId = string | null | undefined;

interface State {
  byOrg: Record<string, v1RequestType[]>;
  inflight: Record<string, Promise<void> | undefined>;
  ensureLoaded: (orgId: OrgId) => Promise<void>;
  invalidate: (orgId?: OrgId) => void;
}

export const useRequestClassifierStore = create<State>((set, get) => ({
  byOrg: {},
  inflight: {},

  ensureLoaded: async (orgId) => {
    if (!orgId) return;
    const s = get();
    if (s.byOrg[orgId]) return;
    const running = s.inflight[orgId];
    if (running) return running;

    const p = (async () => {
      try {
        const res =
          await RequestClassifierQueryService.requestClassifierQueryListActiveRequestTypesByOrganization(
            orgId,
            200,
          );
        const types = res && "items" in res && res.items ? res.items : [];
        set((st) => ({ byOrg: { ...st.byOrg, [orgId]: types } }));
      } finally {
        set((st) => ({ inflight: { ...st.inflight, [orgId]: undefined } }));
      }
    })();

    set((st) => ({ inflight: { ...st.inflight, [orgId]: p } }));
    return p;
  },

  invalidate: (orgId) =>
    set((st) =>
      orgId
        ? { byOrg: { ...st.byOrg, [orgId]: undefined as unknown as v1RequestType[] } }
        : { byOrg: {} },
    ),
}));

export function useRequestClassifier(orgId: OrgId) {
  const ensureLoaded = useRequestClassifierStore((s) => s.ensureLoaded);
  const types = useRequestClassifierStore((s) =>
    orgId ? s.byOrg[orgId] : undefined,
  );
  const inflight = useRequestClassifierStore((s) =>
    orgId ? !!s.inflight[orgId] : false,
  );

  useEffect(() => {
    if (orgId) void ensureLoaded(orgId);
  }, [orgId, ensureLoaded]);

  return {
    types: types ?? [],
    isLoading: !types && (inflight || !!orgId),
  };
}

export function invalidateRequestClassifier(orgId?: OrgId) {
  useRequestClassifierStore.getState().invalidate(orgId);
}
