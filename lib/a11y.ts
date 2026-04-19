// lib/a11y.ts
// Специальные возможности: чёрно-белый режим и масштаб шрифта.
// Применяются через CSS на <html> и сохраняются в localStorage.

export type A11ySettings = {
  grayscale: boolean;
  /** Множитель базового размера шрифта (1 = 100%). */
  fontScale: number;
};

export const DEFAULT_A11Y: A11ySettings = {
  grayscale: false,
  fontScale: 1,
};

export const FONT_SCALE_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0.9, label: "Меньше" },
  { value: 1, label: "Обычный" },
  { value: 1.125, label: "Крупный" },
  { value: 1.25, label: "Очень крупный" },
];

const STORAGE_KEY = "medincident_a11y";

export function loadA11y(): A11ySettings {
  if (typeof window === "undefined") return DEFAULT_A11Y;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y;
    const parsed = JSON.parse(raw) as Partial<A11ySettings>;
    return {
      grayscale: typeof parsed.grayscale === "boolean" ? parsed.grayscale : DEFAULT_A11Y.grayscale,
      fontScale:
        typeof parsed.fontScale === "number" && Number.isFinite(parsed.fontScale)
          ? parsed.fontScale
          : DEFAULT_A11Y.fontScale,
    };
  } catch {
    return DEFAULT_A11Y;
  }
}

export function saveA11y(settings: A11ySettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.) — игнорируем.
  }
}

export function applyA11y(settings: A11ySettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Чёрно-белый режим через CSS-класс (фильтр описан в globals.css).
  root.classList.toggle("a11y-grayscale", settings.grayscale);

  // Масштаб шрифта через базовый font-size на <html>.
  // Все rem-юниты в Tailwind отмасштабируются пропорционально.
  root.style.fontSize = `${settings.fontScale * 100}%`;
}
