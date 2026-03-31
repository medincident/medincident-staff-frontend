"use client";

import { useState, useEffect } from "react";
import { X, Download, SquarePlus, SquareArrowUp } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button"; // Предполагаю, что у тебя есть этот компонент

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Проверяем, установлено ли уже приложение
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // 2. Определяем ОС и тип устройства
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    setIsIOS(ios);
    setIsMobile(mobile);

    // Проверяем, закрывал ли юзер этот попап ранее
    const hasDismissed = localStorage.getItem("installPromptDismissed");

    // Для iOS событие beforeinstallprompt не работает, поэтому показываем сразу (если это мобилка и попап не закрывали)
    if (ios && mobile && !standalone && !hasDismissed) {
      setIsVisible(true);
    }

    // 3. Ловим событие установки (для Android)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Останавливаем стандартный показ
      setDeferredPrompt(e);
      
      // Показываем нашу модалку только если это мобилка и юзер её не закрывал
      if (mobile && !hasDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Функция закрытия с запоминанием
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  // Функция вызова системного окна установки (Android)
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false); // Прячем после успешной установки
    }
    setDeferredPrompt(null);
  };

  // Если это ПК, или уже установлено, или скрыто — ничего не рендерим
  if (isStandalone || !isVisible || !isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-background border rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-300">
        
        <button
          onClick={handleClose}
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

        {/* Инструкция для iOS */}
        {isIOS && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border text-center">
            <p className="mb-2 font-medium">Как установить на iOS:</p>
            <ol className="list-decimal list-inside space-y-2 text-left inline-block">
              <li>
                Нажмите кнопку{" "}
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border bg-background text-foreground font-bold mx-1 gap-1 leading-none">
                  <SquareArrowUp className="h-4 w-4" /> Поделиться
                </span>
              </li>
              <li>
                Внизу выберите{" "}
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border bg-background text-foreground font-bold mx-1 gap-1 leading-none">
                  <SquarePlus className="h-5 w-5" /> Добавить на экран "Домой"
                </span>{" "}
              </li>
            </ol>
          </div>
        )}

        {/* Кнопка установки для Android */}
        {!isIOS && deferredPrompt && (
          <Button onClick={handleInstallClick} className="w-full mt-2 font-bold">
            Установить сейчас
          </Button>
        )}
      </div>
    </div>
  );
}