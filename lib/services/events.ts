// lib/services/events.ts

// Мок-данные для примера
const MOCK_EVENT_DETAILS = {
  id: "evt_1",
  categoryId: "safety",
  typeId: "fall_patient",
  description:
    "Пациент упал при попытке встать с кровати. Медсестра оказала помощь.",
  status: "in_work",
  createdAt: "2025-11-24T10:30:00Z",
};

export async function getEventById(id: string) {
  // ------------------------------------------------------------------
  // ЗДЕСЬ БУДЕТ ЗАПРОС К ВНЕШНЕМУ БЕКЕНДУ
  // const res = await fetch(`${process.env.BACKEND_URL}/api/v1/incidents/${id}`);
  // if (!res.ok) return null;
  // return res.json();
  // ------------------------------------------------------------------

  // Имитация задержки базы данных
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Если ID специфический, вернем мок, иначе сгенерируем заглушку
  if (id === "evt_1") {
    return MOCK_EVENT_DETAILS;
  }

  // Возвращаем заглушку с правильным ID, чтобы форма открылась
  return {
    ...MOCK_EVENT_DETAILS,
    id: id,
    description: `Редактирование события ${id} (автогенерирация)`,
  };
}
