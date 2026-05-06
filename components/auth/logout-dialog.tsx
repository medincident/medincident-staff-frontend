"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { logout } from "@/lib/auth/logout";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idToken?: string | null;
}

export function LogoutDialog({ open, onOpenChange, idToken }: LogoutDialogProps) {
  const [keepSession, setKeepSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (open) {
      setKeepSession(true);
      setIsLoggingOut(false);
    }
  }, [open]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout({ keepSession, idToken });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isLoggingOut && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoggingOut}>
        <DialogHeader>
          <DialogTitle>Выход</DialogTitle>
          <DialogDescription className="sr-only">
            Параметры выхода из аккаунта
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start justify-between gap-4 py-2">
          <div className="space-y-1 min-w-0">
            <Label
              htmlFor="logout-keep-session"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Сохранить данные для быстрого входа
            </Label>
            <p className="text-xs text-muted-foreground leading-snug">
              Отключите, если вошли не на своём устройстве.
            </p>
          </div>
          <Switch
            id="logout-keep-session"
            checked={keepSession}
            onCheckedChange={setKeepSession}
            disabled={isLoggingOut}
            className="mt-0.5"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut}
          >
            Отмена
          </Button>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Выйти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
