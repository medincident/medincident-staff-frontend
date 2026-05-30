"use client";

import { create } from "zustand";

// Императивная модалка-подтверждение: `confirm({...})` возвращает Promise<boolean>,
// внутри использует один смонтированный <ConfirmDialog/> (см. components/ui/confirm-dialog.tsx).

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface State {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((ok: boolean) => void) | null;
  ask: (options: ConfirmOptions) => Promise<boolean>;
  answer: (ok: boolean) => void;
}

export const useConfirmStore = create<State>((set, get) => ({
  open: false,
  options: null,
  resolve: null,

  ask: (options) =>
    new Promise<boolean>((resolve) => {
      // Если что-то уже висит — отвечаем «нет» для прошлого, чтобы не было утечек.
      const prev = get().resolve;
      if (prev) prev(false);
      set({ open: true, options, resolve });
    }),

  answer: (ok) => {
    const r = get().resolve;
    if (r) r(ok);
    set({ open: false, resolve: null, options: null });
  },
}));

// Хук для вызова из любого компонента: const confirm = useConfirm();
export function useConfirm() {
  return useConfirmStore((s) => s.ask);
}
