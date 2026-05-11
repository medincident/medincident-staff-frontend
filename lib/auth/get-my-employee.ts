import {
  SelfQueryService,
  v1EmployeeCardView,
} from "@/lib/api-generated";

// Источник данных — `SelfQueryService` бэка (PR medincident-backend#155):
// `ListMyOrganizations` отдаёт орги, в которых юзер реально нанят, а
// `GetMyEmployment(orgId)` — карточку сотрудника в конкретной орге.
// Мы кэшируем карточки в sessionStorage по zitadelUserId, чтобы хук
// useMyEmployee не дёргал сеть при каждом маунте.

const CACHE_KEY_PREFIX = "myEmployees:";

function readCache(zitadelUserId: string): v1EmployeeCardView[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + zitadelUserId);
    return raw ? (JSON.parse(raw) as v1EmployeeCardView[]) : null;
  } catch {
    return null;
  }
}

function writeCache(zitadelUserId: string, items: v1EmployeeCardView[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + zitadelUserId, JSON.stringify(items));
  } catch {
    // private mode / переполнение — игнорируем
  }
}

export function clearMyEmployeeCache(): void {
  if (typeof window === "undefined") return;
  // Чистим всё связанное с identity/ролями/employees при logout — иначе
  // следующий юзер на той же машине попадёт на чужой кэш.
  const PREFIXES = [CACHE_KEY_PREFIX, "myEmployee:", "myIdentity:", "myOrgRole:"];
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    if (PREFIXES.some((p) => key.startsWith(p))) sessionStorage.removeItem(key);
  }
}

let inflight: Promise<v1EmployeeCardView[]> | null = null;

export async function getMyEmployees(
  zitadelUserId: string,
): Promise<v1EmployeeCardView[]> {
  if (!zitadelUserId) return [];

  const cached = readCache(zitadelUserId);
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const found: v1EmployeeCardView[] = [];
    try {
      const orgsRes = await SelfQueryService.selfQueryListMyOrganizations();
      const orgs = ((orgsRes as any)?.items ?? []) as Array<{ id?: string }>;

      // По одной orgId дёргаем GetMyEmployment — так возвращается полная
      // карточка с departmentId/clinicId/position. Параллельно через
      // Promise.all, чтобы не пилить N+1 последовательно.
      const employments = await Promise.all(
        orgs
          .filter((o) => o.id)
          .map((o) =>
            SelfQueryService.selfQueryGetMyEmployment(o.id as string)
              .then((res) => ((res as any)?.employee ?? null) as v1EmployeeCardView | null)
              .catch(() => null),
          ),
      );

      for (const emp of employments) {
        if (emp) found.push(emp);
      }
      writeCache(zitadelUserId, found);
      return found;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getMyEmployeeInOrg(
  zitadelUserId: string,
  orgId: string | null | undefined,
): Promise<v1EmployeeCardView | null> {
  if (!zitadelUserId || !orgId) return null;
  const all = await getMyEmployees(zitadelUserId);
  return all.find((e) => e.organizationId === orgId) ?? null;
}

// Fallback на первую найденную карточку — для UI, где конкретная орга
// не важна (шапка). Для скоупа к активной — getMyEmployeeInOrg.
export async function getMyEmployee(
  zitadelUserId: string,
): Promise<v1EmployeeCardView | null> {
  const all = await getMyEmployees(zitadelUserId);
  return all[0] ?? null;
}
