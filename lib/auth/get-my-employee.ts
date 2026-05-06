import {
  MembershipQueryServiceService,
  OrgStructureQueryServiceService,
  v1EmployeeCardView,
} from "@/lib/api-generated";

// ⚠️ ВРЕМЕННЫЙ ХАК — medincident-backend#146.
// На бэке нет lookup'а employee по zitadel_user_id, поэтому перебираем
// все организации и собираем матчи. UNIQUE(organization_id, zitadel_user_id)
// допускает мульти-орг — отсюда массив. После фикса бэка заменить тело
// `getMyEmployees` на один вызов нового RPC.

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
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(CACHE_KEY_PREFIX)) sessionStorage.removeItem(key);
    // Старый ключ single-employee из предыдущей версии хелпера.
    if (key?.startsWith("myEmployee:")) sessionStorage.removeItem(key);
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
      const orgsRes = await OrgStructureQueryServiceService.orgStructureQueryServiceListOrganizations(100);
      const orgs = (orgsRes as any)?.items ?? [];

      for (const org of orgs) {
        if (!org?.id) continue;
        try {
          const empRes = await MembershipQueryServiceService.membershipQueryServiceListEmployeesByOrganization(
            org.id,
            500,
            undefined,
            true,
          );
          const items = ((empRes as any)?.items ?? []) as v1EmployeeCardView[];
          const match = items.find((e) => e.zitadelUserId === zitadelUserId);
          if (match) found.push(match);
        } catch {
          // Нет прав на чтение employees этой орги — пропускаем.
        }
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
