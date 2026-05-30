"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LogIn, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { logout } from "@/lib/auth/logout";

// При RefreshAccessTokenError куки валидны, но запросы вернут 401.
export function SessionExpiredBanner() {
  const { data: session } = useSession();
  const [isReauthing, setIsReauthing] = useState(false);

  const error = (session as any)?.error as string | undefined;
  const open = error === "RefreshAccessTokenError";

  const handleReauth = async () => {
    setIsReauthing(true);
    // SSO в Zitadel мог умереть вместе с refresh-токеном — гасим целиком.
    await logout({ keepSession: false });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <ShieldAlert className="h-6 w-6 text-warning" aria-hidden />
          </div>
          <DialogTitle className="text-center">Сессия устарела</DialogTitle>
          <DialogDescription className="text-center">
            Не удалось продлить авторизацию. Войдите заново, чтобы продолжить работу.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleReauth} disabled={isReauthing} className="w-full sm:w-auto">
            {isReauthing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Войти повторно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
