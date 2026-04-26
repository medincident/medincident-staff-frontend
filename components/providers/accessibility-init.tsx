"use client";

import { useEffect } from "react";
import { applyA11y, loadA11y } from "@/lib/a11y";

export function AccessibilityInit() {
  useEffect(() => {
    applyA11y(loadA11y());
  }, []);
  return null;
}
