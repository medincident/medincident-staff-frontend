// lib/services/requests.ts

const MOCK_REQUEST_DETAILS = {
  id: "req_1",
  number: 1024,
  type: "plumbing",
  location: "Кабинет 305",
  priority: "urgent",
  status: "in_work",
  description: "Протекает кран в процедурной, вода на полу",
  authorName: "Иванов И.И.",
  createdAt: "2025-11-24T09:00:00Z",
  linkedEventId: null,
};

export async function getRequestById(id: string) {
  // ------------------------------------------------------------------
  // ЗДЕСЬ БУДЕТ ЗАПРОС К ВНЕШНЕМУ БЕКЕНДУ (Java/Python/Go...)
  // const res = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${id}`);
  // if (!res.ok) return null;
  // return res.json();
  // ------------------------------------------------------------------

  // Имитация задержки БД
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Возвращаем мок с правильным ID
  // В реальности вернем null, если не найдено
  if (id === "not-found") return null;

  return { ...MOCK_REQUEST_DETAILS, id };
}
