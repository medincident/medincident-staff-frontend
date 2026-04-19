"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Contrast, Type, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import {
  A11ySettings,
  DEFAULT_A11Y,
  FONT_SCALE_OPTIONS,
  applyA11y,
  loadA11y,
  saveA11y,
} from "@/lib/a11y";

export function AccessibilityView() {
  const router = useRouter();
  const [settings, setSettings] = useState<A11ySettings | null>(null);

  useEffect(() => {
    setSettings(loadA11y());
  }, []);

  const update = (patch: Partial<A11ySettings>) => {
    setSettings((prev) => {
      const next = { ...(prev ?? DEFAULT_A11Y), ...patch };
      saveA11y(next);
      applyA11y(next);
      return next;
    });
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_A11Y);
    saveA11y(DEFAULT_A11Y);
    applyA11y(DEFAULT_A11Y);
    notify.info("Настройки сброшены", "Применены значения по умолчанию.");
  };

  // Пока грузится — показываем хедер, но сами настройки без вспышки.
  const current = settings ?? DEFAULT_A11Y;
  const isReady = settings !== null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground line-clamp-2 break-words">
              Специальные возможности
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              Настройки интерфейса для комфортной работы
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          disabled={!isReady}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      {/* ЧЁРНО-БЕЛЫЙ РЕЖИМ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
              <Contrast className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">
                Чёрно-белый режим
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Убирает цвет из интерфейса — полезно при дальтонизме и для
                снижения зрительной нагрузки
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label
              htmlFor="a11y-grayscale"
              className="text-sm text-foreground cursor-pointer"
            >
              Включить чёрно-белый режим
            </Label>
            <Switch
              id="a11y-grayscale"
              checked={current.grayscale}
              disabled={!isReady}
              onCheckedChange={(v) => update({ grayscale: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* РАЗМЕР ШРИФТА */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">
                Размер шрифта
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Изменения применяются сразу ко всему приложению
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
            {FONT_SCALE_OPTIONS.map((opt) => {
              const isActive =
                Math.abs(current.fontScale - opt.value) < 0.001;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={!isReady}
                  onClick={() => update({ fontScale: opt.value })}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-0",
                    isActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-foreground/30 hover:bg-muted/50",
                  )}
                >
                  <span
                    className="font-semibold text-foreground leading-none"
                    style={{ fontSize: `${opt.value * 1.25}rem` }}
                  >
                    Aa
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium text-center break-words max-w-full",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Превью */}
          <div className="mt-6 rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Превью
            </p>
            <p className="text-base text-foreground">
              Пример обычного текста — как будут выглядеть названия заявок и
              событий.
            </p>
            <p className="text-sm text-muted-foreground">
              Дополнительное описание, подписи и мета-информация.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
