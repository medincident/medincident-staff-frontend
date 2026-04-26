"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, SquareArrowUp, SquarePlus, X } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useMiniApp } from "@/lib/miniapp";

const DISMISS_KEY = "installPromptDismissedAt";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

function isRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const miniApp = useMiniApp();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua =
      navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios && !standalone && !isRecentlyDismissed()) {
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      if (isRecentlyDismissed()) return;

      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsStandalone(true);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {}
    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  if (miniApp || isStandalone || !isVisible) return null;

  if (!isIOS && !deferredPrompt) return null;

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
            Установите <strong>{APP_CONFIG.name}</strong> на свой экран «Домой»
            для быстрого доступа и работы офлайн.
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

        {/* Кнопка установки для Android / desktop Chromium */}
        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full mt-2 font-bold"
          >
            Установить сейчас
          </Button>
        )}
      </div>
    </div>
  );
}
