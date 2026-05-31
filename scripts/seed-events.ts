// Дополнение к scripts/seed.ts — добавляет 300 НС и 300 заявок.
// Использует существующую структуру и классификатор (читает их из API).
// occurredAt отправляет «сейчас» (бэк ограничивает 48h окном), даты потом
// распределяет SQL-постфикс `seed-spread-dates.sh`.
// Запуск: bun scripts/seed-events.ts <BEARER>

const TOKEN = process.argv[2] || process.env.BEARER;
if (!TOKEN) {
  console.error("Usage: bun scripts/seed-events.ts <BEARER>");
  process.exit(1);
}
const ORG = "019e1786-563a-7b3e-846b-ad9de0a219b9";
const ME = "019e2570-1aec-7d1b-a9b6-7aa8f989db7e";
const BASE = "https://patient-medincident.ulbwa.bombomeow.ru/api";

async function call(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return data;
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  // 1. Структуру читаем
  const clinics = (await call("GET", `/v1/organizations/${ORG}/clinics?pageSize=100`)).items as any[];
  const allDeptIds: string[] = [];
  for (const c of clinics) {
    const dRes = await call("GET", `/v1/clinics/${c.id}/departments?pageSize=100`);
    for (const d of dRes.items ?? []) allDeptIds.push(d.id);
  }
  console.log(`structure: ${clinics.length} clinics, ${allDeptIds.length} depts`);

  // 2. Категории и типы
  const cats = (await call("GET", `/v1/organizations/${ORG}/incident-categories?pageSize=100`)).items as any[];
  const allTypePairs: { categoryId: string; typeId: string }[] = [];
  for (const cat of cats) {
    const tRes = await call("GET", `/v1/incident-categories/${cat.id}/types?pageSize=100`);
    for (const t of tRes.items ?? []) {
      allTypePairs.push({ categoryId: cat.id, typeId: t.id });
    }
  }
  console.log(`classifier: ${cats.length} cats, ${allTypePairs.length} types`);

  // 3. Типы заявок. Удалим случайно созданный _test, если есть.
  const reqTypesRaw = (await call("GET", `/v1/organizations/${ORG}/request-types?pageSize=100`)).items as any[];
  const reqTypeIds: string[] = [];
  for (const rt of reqTypesRaw) {
    if (rt.name === "_test") {
      try { await call("DELETE", `/v1/request-types/${rt.id}`); console.log("   cleaned _test"); } catch {}
      continue;
    }
    reqTypeIds.push(rt.id);
  }
  console.log(`request types: ${reqTypeIds.length}`);

  const INCIDENT_DESC = [
    "Зафиксировано при плановом обходе.",
    "Случай выявлен по результатам внутреннего аудита.",
    "Обнаружено старшей медсестрой смены.",
    "Подтверждено документами и записью в журнале.",
    "Случай разобран на утренней конференции.",
    "Передано в работу группе качества.",
    "Зафиксировано во время приёма дежурной смены.",
    "Выявлено в ходе проверки СОП.",
  ];
  const REQUEST_DESC = [
    "Требуется срочная реакция инженерной/IT-службы.",
    "По графику плановой работы.",
    "Заявка от старшей медсестры смены.",
    "По результатам обхода.",
    "Заявка передана из соседнего отделения.",
    "Согласовано с руководителем подразделения.",
    "После случая ИСМП — внеплановая дезинфекция.",
    "Регулярная плановая заявка на расходники.",
  ];

  const seedStart = new Date().toISOString();
  console.log(`seedStart=${seedStart}`);

  // 4. 300 incidents — все с occurredAt = ~now (1-12h назад чтобы наверняка в окне).
  console.log("\n→ 300 incidents");
  let okI = 0, failI = 0;
  for (let i = 0; i < 300; i++) {
    const occurredAt = new Date(Date.now() - 60 * 60 * 1000 - Math.random() * 11 * 3600_000).toISOString();
    const tp = pick(allTypePairs);
    try {
      await call("POST", `/v1/incidents`, {
        departmentId: pick(allDeptIds),
        categoryId: tp.categoryId,
        typeId: tp.typeId,
        description: pick(INCIDENT_DESC),
        occurredAt,
      });
      okI++;
      if (okI % 30 === 0) process.stdout.write(` ${okI}`);
    } catch (e) {
      failI++;
      if (failI <= 3) console.error("\n  fail:", (e as Error).message);
    }
  }
  console.log(`\n   ok: ${okI}/300 (failed: ${failI})`);

  // 5. 300 service requests
  console.log("\n→ 300 service requests");
  let okR = 0, failR = 0;
  for (let i = 0; i < 300; i++) {
    try {
      await call("POST", `/v1/service-requests`, {
        departmentId: pick(allDeptIds),
        typeId: pick(reqTypeIds),
        description: pick(REQUEST_DESC),
        executorEmployeeIds: [ME],
      });
      okR++;
      if (okR % 30 === 0) process.stdout.write(` ${okR}`);
    } catch (e) {
      failR++;
      if (failR <= 3) console.error("\n  fail:", (e as Error).message);
    }
  }
  console.log(`\n   ok: ${okR}/300 (failed: ${failR})`);

  console.log(`\n✓ done. Now run:\n  SEED_START='${seedStart}' bash scripts/seed-spread-dates.sh`);
}

main().catch((e) => { console.error("\nFATAL:", e); process.exit(1); });
