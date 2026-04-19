"use client";

import { useEffect } from "react";
import { applyA11y, loadA11y } from "@/lib/a11y";

// Считывает настройки а11y из localStorage и применяет их к документу
// при первом рендере (и больше ничего). Рендерит null.
export function AccessibilityInit() {
  useEffect(() => {
    applyA11y(loadA11y());
  }, []);
  return null;
}
