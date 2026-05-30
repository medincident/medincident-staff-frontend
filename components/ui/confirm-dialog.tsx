"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmStore } from "@/lib/confirm-dialog/store";

// Один экземпляр монтируется в app/(main)/layout.tsx. Состояние — в zustand-сторе.
export function ConfirmDialog() {
  const open = useConfirmStore((s) => s.open);
  const options = useConfirmStore((s) => s.options);
  const answer = useConfirmStore((s) => s.answer);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && answer(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options?.title}</DialogTitle>
          {options?.description ? (
            <DialogDescription>{options.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => answer(false)}>
            {options?.cancelLabel ?? "Отмена"}
          </Button>
          <Button
            variant={options?.destructive ? "destructive" : "default"}
            onClick={() => answer(true)}
          >
            {options?.confirmLabel ?? "Подтвердить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
