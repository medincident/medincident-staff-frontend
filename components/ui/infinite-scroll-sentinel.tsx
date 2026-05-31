"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  /** Есть ли ещё страница для подгрузки. */
  hasMore: boolean;
  /** Сейчас идёт загрузка следующей страницы. */
  isLoadingMore: boolean;
  /** Колбэк подгрузки следующей страницы. */
  onLoadMore: () => void;
  /**
   * Отступ от низа viewport, при пересечении которого триггерится подгрузка.
   * 200px по умолчанию: начинаем грузить заранее, чтобы юзер не упирался в
   * пустое место.
   */
  rootMargin?: string;
}

// Sentinel-элемент для бесконечного скролла. Рендерится в конце списка,
// наблюдается IntersectionObserver — попал в зону видимости → onLoadMore().
export function InfiniteScrollSentinel({
  hasMore,
  isLoadingMore,
  onLoadMore,
  rootMargin = "200px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, rootMargin]);

  if (!hasMore && !isLoadingMore) return null;

  return (
    <div
      ref={ref}
      className="flex justify-center items-center py-6 text-xs text-muted-foreground"
    >
      {isLoadingMore ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Загружаем…
        </span>
      ) : (
        // Невидимый разделитель: для observer'а нужна только высота, текст
        // показывать незачем — у нас же auto-load.
        <span className="opacity-0 select-none">.</span>
      )}
    </div>
  );
}
