"use client";

import { useEffect } from "react";
import { create } from "zustand";

import {
  IncidentClassifierQueryService,
  v1Category,
  classifierV1Type,
} from "@/lib/api-generated";
import { fetchAllPages } from "@/lib/api/paginate";

// Общий кеш справочника НС по orgId. Админка вызывает invalidate() после мутаций.

interface OrgClassifier {
  categories: v1Category[];
  types: classifierV1Type[];
}

type OrgId = string | null | undefined;

interface State {
  byOrg: Record<string, OrgClassifier>;
  // orgId, по которым запрос сейчас в полёте — для дедупа параллельных вызовов.
  inflight: Record<string, Promise<void> | undefined>;
  ensureLoaded: (orgId: OrgId) => Promise<void>;
  /** Сбросить кеш: всё (без аргумента) или конкретную организацию. */
  invalidate: (orgId?: OrgId) => void;
}

export const useIncidentClassifierStore = create<State>((set, get) => ({
  byOrg: {},
  inflight: {},

  ensureLoaded: async (orgId) => {
    if (!orgId) return;
    const s = get();
    if (s.byOrg[orgId]) return; // уже в кеше
    const running = s.inflight[orgId];
    if (running) return running; // запрос уже идёт — переиспользуем

    // Справочники подгружаются один раз на сессию. Чем крупнее страница,
    // тем меньше последовательных RTT — для типов НС, которых в крупном НМИЦ
    // легко 3–5 тыс., page=200 даёт 15–25 последовательных запросов.
    const PAGE = 1000;
    const p = (async () => {
      try {
        const [categories, types] = await Promise.all([
          fetchAllPages<v1Category>((cursor) =>
            IncidentClassifierQueryService.incidentClassifierQueryListCategoriesByOrganization(orgId, PAGE, cursor),
          ),
          fetchAllPages<classifierV1Type>((cursor) =>
            IncidentClassifierQueryService.incidentClassifierQueryListTypesByOrganization(orgId, PAGE, cursor),
          ),
        ]);
        set((st) => ({ byOrg: { ...st.byOrg, [orgId]: { categories, types } } }));
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
        ? { byOrg: { ...st.byOrg, [orgId]: undefined as unknown as OrgClassifier } }
        : { byOrg: {} },
    ),
}));

const EMPTY: OrgClassifier = { categories: [], types: [] };

// Хук-обёртка: подтягивает справочник для активной орги (один раз на orgId),
// возвращает категории/типы и флаг загрузки.
export function useIncidentClassifier(orgId: OrgId) {
  const ensureLoaded = useIncidentClassifierStore((s) => s.ensureLoaded);
  const data = useIncidentClassifierStore((s) =>
    orgId ? s.byOrg[orgId] : undefined,
  );
  const inflight = useIncidentClassifierStore((s) =>
    orgId ? !!s.inflight[orgId] : false,
  );

  useEffect(() => {
    if (orgId) void ensureLoaded(orgId);
  }, [orgId, ensureLoaded]);

  return {
    categories: data?.categories ?? EMPTY.categories,
    types: data?.types ?? EMPTY.types,
    isLoading: !data && (inflight || !!orgId),
  };
}

// Хелпер для админки/мутаций: сбросить кеш, чтобы Dashboard/журнал
// подтянули свежий справочник при следующем заходе.
export function invalidateIncidentClassifier(orgId?: OrgId) {
  useIncidentClassifierStore.getState().invalidate(orgId);
}
