#!/usr/bin/env node
// Прогоняем openapi-typescript-codegen по предварительно «очищенной» копии
// swagger-файла: убираем суффикс `Service` из имён тегов и из префикса
// operationId. Иначе grpc-gateway-овские теги вида `XxxQueryService`
// превращаются в классы `XxxQueryServiceService` — лишний `Service`
// уезжает в имя класса при генерации.
//
// Использование:
//   node scripts/codegen.mjs                                 # дефолт — medincident-backend
//   node scripts/codegen.mjs --src=notifications.swagger.json --out=lib/notifications-api-generated
//   node scripts/codegen.mjs notifications                   # alias для notifications

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Парсим аргументы. Поддерживаем `--src=...` `--out=...` `--tmp-name=...`,
// плюс preset-алиасы (медицинский бэкенд по умолчанию или "notifications").
const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.replace(/^--/, "").split("=");
      return [k, rest.join("=") || true];
    }),
);
const positional = args.filter((a) => !a.startsWith("--"));
const preset = positional[0];

const presets = {
  default: {
    src: "medincident.swagger.json",
    out: "lib/api-generated",
    tmpName: "swagger.sanitized.json",
  },
  notifications: {
    src: "notifications.swagger.json",
    out: "lib/notifications-api-generated",
    tmpName: "notifications.sanitized.json",
  },
};

const config = { ...(presets[preset] ?? presets.default), ...flags };

const SRC = resolve(ROOT, config.src);
const TMP_DIR = resolve(ROOT, "node_modules/.cache/codegen");
const TMP = resolve(TMP_DIR, config.tmpName ?? "swagger.sanitized.json");
const OUT = resolve(ROOT, config.out);

const stripService = (name) =>
  typeof name === "string" && name.endsWith("Service") && name !== "Service"
    ? name.slice(0, -"Service".length)
    : name;

const stripServiceFromOpId = (opId) => {
  if (typeof opId !== "string") return opId;
  const i = opId.indexOf("_");
  if (i < 0) return opId;
  return stripService(opId.slice(0, i)) + opId.slice(i);
};

const swagger = JSON.parse(readFileSync(SRC, "utf8"));

if (Array.isArray(swagger.tags)) {
  swagger.tags = swagger.tags.map((t) => ({ ...t, name: stripService(t.name) }));
}

for (const path of Object.values(swagger.paths ?? {})) {
  for (const method of Object.values(path)) {
    if (!method || typeof method !== "object") continue;
    if (Array.isArray(method.tags)) {
      method.tags = method.tags.map(stripService);
    }
    if (method.operationId) {
      method.operationId = stripServiceFromOpId(method.operationId);
    }
  }
}

mkdirSync(TMP_DIR, { recursive: true });
writeFileSync(TMP, JSON.stringify(swagger));

rmSync(OUT, { recursive: true, force: true });

const r = spawnSync(
  "npx",
  ["openapi-typescript-codegen", "--input", TMP, "--output", OUT, "--client", "axios"],
  { stdio: "inherit", cwd: ROOT },
);

if (r.status !== 0) process.exit(r.status ?? 1);
