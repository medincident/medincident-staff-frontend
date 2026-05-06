// Тримит строку и схлопывает внутренние whitespace-кластеры — бэк
// валидирует `no_extra_ws` (нет ведущих/хвостовых пробелов и двух и
// более подряд). Пустая строка → undefined: удобно для опциональных
// полей с `omitnil` (`...(x ? { x } : {})`).
export function cleanText(input: string | null | undefined): string | undefined {
  if (input == null) return undefined;
  const cleaned = input.trim().replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : undefined;
}
