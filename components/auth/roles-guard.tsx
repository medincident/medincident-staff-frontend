"use client";

import { useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutDialog } from "@/components/auth/logout-dialog";
import { useMyIdentity } from "@/lib/auth/use-my-identity";
import { getMyEmployees } from "@/lib/auth/get-my-employee";

// Пускаем юзера на сайт, если он либо system_admin, либо нанят хотя бы
// в одной организации. Иначе — заглушка с предложением обратиться к
// администратору. Источники — SelfQueryService.GetMyIdentity и
// ListMyOrganizations + GetMyEmployment (medincident-backend#155).
export function RolesGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { identity, isLoading: isIdentityLoading } = useMyIdentity();

  const [hasAnyEmployment, setHasAnyEmployment] = useState<boolean | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setHasAnyEmployment(null);
      return;
    }
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      setHasAnyEmployment(null);
      return;
    }

    let cancelled = false;
    getMyEmployees(userId)
      .then((emps) => {
        if (!cancelled) setHasAnyEmployment(emps.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasAnyEmployment(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  if (status === "loading" || isIdentityLoading || hasAnyEmployment === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return <>{children}</>;
  }

  const isSystemAdmin = identity?.isSystemAdmin ?? false;
  if (isSystemAdmin || hasAnyEmployment) {
    return <>{children}</>;
  }

  const userName =
    (session?.user as any)?.name ||
    (session?.user as any)?.email ||
    "Пользователь";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-warning" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Доступ запрещён</h1>
          <p className="text-sm text-muted-foreground leading-snug">
            Аккаунт <span className="text-foreground font-medium">{userName}</span> не привязан ни к одной организации.
            Обратитесь к администратору, чтобы получить доступ.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsLogoutOpen(true)}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>

      <LogoutDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        idToken={(session as any)?.idToken}
      />
    </div>
  );
}
