import { notFound } from "next/navigation";
import { EventForm } from "@/components/forms/event-form";

// ЭТО ЗАГЛУШКА (MOCK). В реальности вы сделаете запрос к API/БД.
// Функция должна вернуть данные в том формате, который ожидает форма (ID категорий, а не названия).
const getEventById = (id: string) => {
  // Пример: Если ID = evt_1, возвращаем заполненные данные
  if (id === "evt_1") {
    return {
      id: "evt_1",
      categoryId: "safety", // ID из вашего CLASSIFIER
      typeId: "fall_patient", // ID из вашего CLASSIFIER
      description: "Пациент упал при попытке встать с кровати. Медсестра оказала помощь.",
    };
  }
  
  // Для теста возвращаем заглушку для любого ID
  return {
    id: id,
    categoryId: "medication", 
    typeId: "dosage_error",
    description: "Тестовое описание для редактирования события " + id,
  };
};

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default function EditEventPage({ params }: EditEventPageProps) {
  // 1. Получаем данные
  const eventData = getEventById(params.id);

  // 2. Если событие не найдено — 404
  if (!eventData) {
    return notFound();
  }

  // 3. Рендерим форму с initialData
  return <EventForm initialData={eventData} />;
}