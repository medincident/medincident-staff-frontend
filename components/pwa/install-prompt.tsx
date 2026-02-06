"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      toast.info("Для установки нажмите 'Поделиться' и выберите 'На экран Домой'");
    }
  };

  if (!isIOS && !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-sm">Установить приложение</h3>
        <p className="text-xs text-muted-foreground">
          Установите MedIncident для быстрого доступа.
        </p>
        <Button size="sm" onClick={handleInstallClick}>
          Установить
        </Button>
        {isIOS && (
          <p className="text-xs text-muted-foreground mt-2">
            Нажмите <span className="text-lg">share</span>, затем "На экран «Домой»" 
            <span className="text-lg"> +</span>
          </p>
        )}
      </div>
    </div>
  );
}