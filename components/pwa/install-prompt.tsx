"use client";

import { useState, useEffect } from "react";
import { X, Download, SquarePlus, SquareArrowUp } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || !isVisible) {
    return null;
  }

  if (!isIOS && !deferredPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">

      <div className="relative w-full max-w-sm bg-background border rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-300">

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Закрыть</span>
        </button>

        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Download className="text-primary h-6 w-6" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            Установить приложение
          </h3>
          <p className="text-sm text-muted-foreground">
            Установите <strong>{APP_CONFIG.name}</strong> на свой экран «Домой» для быстрого доступа и работы офлайн.
          </p>
        </div>

        {isIOS && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border text-center">
            <p className="mb-2 font-medium">Как установить на iOS:</p>
            <ol className="list-decimal list-inside space-y-1 text-left inline-block">
              <li>
                Нажмите кнопку{" "}
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border bg-background text-foreground font-bold mx-1">
                  <SquareArrowUp className="h-4 w-4 mb-0.5" /> Поделиться
                </span>
              </li>
              <li>
                Внизу выберите{" "}
                <span className="font-semibold text-foreground">
                  « <SquarePlus className="inline h-5 w-5 ml-1" /> Добавить на экран "Домой"»
                </span>{" "}
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}