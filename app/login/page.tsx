"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AutoLoginPage() {
  useEffect(() => {
    signIn("zitadel");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-sm font-medium">
        Защищенное соединение. Перенаправляем на авторизацию...
      </p>
    </div>
  );
}