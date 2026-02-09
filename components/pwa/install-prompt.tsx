"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; // Импортируем иконку крестика (если есть lucide-react)
import { toast } from "sonner";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true); // Состояние видимости

  useEffect(() => {
    // Проверяем, установлено ли уже приложение
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Проверяем iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true); // Показываем окно, если браузер предложил установку
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Если уже установлено или пользователь закрыл окно — не показываем
  if (isStandalone || !isVisible) {
    return null;
  }

  // Если это не iOS и браузер сам не предложил установку (deferredPrompt нет) — не показываем
  // (Хотя для дебага можно временно убрать это условие)
  if (!isIOS && !deferredPrompt) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else if (isIOS) {
      toast.info("Следуйте инструкции на экране");
    }
  };

  return (
    // 1. Контейнер на весь экран с затемнением (Backdrop)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">

      {/* 2. Карточка по центру */}
      <div className="relative w-full max-w-sm bg-background border rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-300">

        {/* Кнопка закрыть */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Закрыть</span>
        </button>

        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            {/* Иконка скачивания или логотип */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary h-6 w-6"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            Установить приложение
          </h3>
          <p className="text-sm text-muted-foreground">
            Установите <strong>MedIncident</strong> на свой экран «Домой» для быстрого доступа и работы офлайн.
          </p>
        </div>

        {/* Основная кнопка */}
        <Button className="w-full" size="lg" onClick={handleInstallClick}>
          Установить сейчас
        </Button>

        {/* Инструкция для iOS */}
        {isIOS && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border text-center">
            <p className="mb-2 font-medium">Как установить на iOS:</p>
            <ol className="list-decimal list-inside space-y-1 text-left inline-block">
              <li>
                Нажмите кнопку{" "}
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border bg-background text-foreground font-bold mx-1">
                  Поделиться <span className="ml-1 text-lg leading-none">⎋</span>
                </span>
              </li>
              <li>
                Внизу выберите{" "}
                <span className="font-semibold text-foreground">
                  «На экран "Домой"»
                </span>{" "}
                <span className="text-lg">➕</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}