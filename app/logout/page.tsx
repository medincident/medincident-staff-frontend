"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <h1 className="text-xl font-semibold mb-2">Вы вышли из системы</h1>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        Сессия завершена. Для повторного входа откройте страницу авторизации.
      </p>
      <Button asChild>
        <Link href="/login">Войти снова</Link>
      </Button>
    </div>
  );
}
