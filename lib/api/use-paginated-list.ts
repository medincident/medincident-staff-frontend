"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Хук для постраничной загрузки списков с курсором.
// Идея: при изменении deps сбрасывает список и грузит первую страницу.
// Кнопка/триггер «Загрузить ещё» вызывает loadMore() — дотягивает следующую
// страницу и аппендит к items.
//
// Бэк-формат ответа везде одинаковый: `{ items?: T[]; nextCursor?: string }`.
// fetcher принимает курсор (undefined для первой страницы) и должен дёргать
// API со своими параметрами + cursor последним аргументом.

interface CursorPage<T> {
  items?: T[];
  nextCursor?: string;
}

interface Options {
  /** Перезагружать при изменении этого массива (как deps useEffect). */
  deps: unknown[];
  /** Не запускать пока false. Удобно когда orgId ещё резолвится. */
  enabled?: boolean;
}

export function usePaginatedList<T>(
  fetcher: (cursor: string | undefined) => Promise<unknown>,
  { deps, enabled = true }: Options,
) {
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Чтобы устаревшая страница не залетела в state после рассинхрона deps.
  const reqIdRef = useRef(0);
  // Сам fetcher держим в ref — иначе пришлось бы зависеть от него
  // в useEffect, а в каждом рендере он новый и эффект бы зацикливался.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // Первая страница.
  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    const myId = ++reqIdRef.current;
    setIsLoading(true);
    setError(null);
    fetcherRef.current(undefined)
      .then((res) => {
        if (reqIdRef.current !== myId) return;
        const page = (res as CursorPage<T>) ?? {};
        setItems(page.items ?? []);
        setNextCursor(page.nextCursor);
      })
      .catch((e) => {
        if (reqIdRef.current !== myId) return;
        setError(e);
      })
      .finally(() => {
        if (reqIdRef.current !== myId) return;
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const myId = reqIdRef.current;
    try {
      const res = await fetcherRef.current(nextCursor);
      if (reqIdRef.current !== myId) return; // deps поменялись — игнорируем
      const page = (res as CursorPage<T>) ?? {};
      setItems((prev) => [...prev, ...(page.items ?? [])]);
      setNextCursor(page.nextCursor);
    } catch (e) {
      if (reqIdRef.current !== myId) return;
      setError(e);
    } finally {
      if (reqIdRef.current === myId) setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const reset = useCallback(() => {
    reqIdRef.current++; // прерывает текущие in-flight результаты
    setItems([]);
    setNextCursor(undefined);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
  }, []);

  return {
    items,
    setItems,
    isLoading,
    isLoadingMore,
    hasMore: !!nextCursor,
    loadMore,
    reset,
    error,
  };
}
