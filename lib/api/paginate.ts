// Контракт страничного ответа на бэке: `{ items?: T[]; nextCursor?: string }`.
// `maxPages` — предохранитель от бесконечных циклов на битом бэке.

interface CursorPage<T> {
  items?: T[];
  nextCursor?: string;
}

/**
 * Перебирает страницы, пока бэк возвращает `nextCursor`.
 *
 * Использование:
 *   const all = await fetchAllPages<v1IncidentView>((cursor) =>
 *     IncidentQueryService.incidentQueryListIncidents(
 *       orgId, statuses, undefined, undefined, undefined,
 *       undefined, undefined, undefined, undefined, 200, cursor,
 *     ),
 *   );
 */
export async function fetchAllPages<T>(
  fetcher: (cursor: string | undefined) => Promise<unknown>,
  options?: { maxPages?: number },
): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined;
  const maxPages = options?.maxPages ?? 100;

  for (let page = 0; page < maxPages; page++) {
    const res = await fetcher(cursor);
    if (!res || typeof res !== "object") break;
    // На ошибке бэк отдаёт {code, message} — items.length будет 0.
    const page_ = res as CursorPage<T>;
    if (page_.items && page_.items.length) out.push(...page_.items);
    if (!page_.nextCursor) break;
    if (page_.nextCursor === cursor) break; // защита от цикла
    cursor = page_.nextCursor;
  }
  return out;
}
