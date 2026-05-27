// Trim + схлопывание whitespace под бэковский no_extra_ws.
// Пустая строка → undefined для опциональных полей.
export function cleanText(input: string | null | undefined): string | undefined {
  if (input == null) return undefined;
  const cleaned = input.trim().replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : undefined;
}
