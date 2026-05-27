"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-warning/15 text-warning-foreground border-b border-warning/30 backdrop-blur supports-[backdrop-filter]:bg-warning/10">
      <div className="mx-auto max-w-6xl flex items-center gap-2 px-4 py-2 text-sm">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span className="font-medium">Нет подключения к сети.</span>
        <span className="text-muted-foreground hidden sm:inline">
          Данные могут быть устаревшими. Действия сохранятся и отправятся при восстановлении связи.
        </span>
      </div>
    </div>
  );
}
