import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Автогенерация — линтить бессмысленно.
    "lib/api-generated/**",
    // Сгенерированные next-pwa файлы.
    "public/sw.js",
    "public/workbox-*.js",
  ]),
  {
    rules: {
      // (session as any) и DTO без расширенных типов — массово; полная
      // типизация — отдельный рефакторинг, пока шумим warning'ом.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Новое строгое правило React 19; у нас init-эффекты с
      // setState(localStorage/etc) — легитимный паттерн.
      "react-hooks/set-state-in-effect": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
