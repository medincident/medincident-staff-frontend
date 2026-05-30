"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Корректирующие и предупреждающие действия (CAPA) по приказу № 785н.
// Бэка пока нет — храним в localStorage. Контракт стора повторяет будущий
// REST API (см. issue medincident-backend), чтобы при появлении эндпоинтов
// заменить реализацию методов, не трогая UI.

export interface CapaEntry {
  id: string;
  organizationId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  introducedAt: string; // ISO-дата "2026-03-15"
  createdAt: string;
}

export interface CapaInput {
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  introducedAt: string;
}

interface State {
  entries: CapaEntry[];
  listByOrg: (orgId: string | null | undefined) => CapaEntry[];
  add: (orgId: string, input: CapaInput) => void;
  update: (id: string, patch: Partial<CapaInput>) => void;
  remove: (id: string) => void;
}

function genId(): string {
  return "capa_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const useCapaStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],

      listByOrg: (orgId) =>
        orgId ? get().entries.filter((e) => e.organizationId === orgId) : [],

      add: (orgId, input) =>
        set((s) => ({
          entries: [
            ...s.entries,
            {
              id: genId(),
              organizationId: orgId,
              createdAt: new Date().toISOString(),
              ...input,
            },
          ],
        })),

      update: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      remove: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: "medincident_capa" },
  ),
);
