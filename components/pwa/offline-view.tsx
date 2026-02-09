"use client";

import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export function OfflineView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center space-y-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Нет интернета</h1>
      <p className="text-muted-foreground max-w-[300px]">
        Похоже, вы не подключены к сети. Проверьте соединение и попробуйте снова.
      </p>

      <Button onClick={() => window.location.reload()}>
        Обновить страницу
      </Button>
    </div>
  );
}