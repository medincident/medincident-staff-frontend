"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AutoLoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
      return;
    }

    if (status === "unauthenticated") {
      signIn(
        "zitadel",
        { callbackUrl: "/dashboard" },
        {
          prompt: "login",
          max_age: "0",
        }
      );
    }
  }, [router, status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-sm font-medium">
        Защищенное соединение. Перенаправляем на авторизацию...
      </p>
    </div>
  );
}