import { Metadata } from "next";
import { EventDetailsView } from "@/components/events/event-details-view";
import { getEventById } from "@/lib/services/events";

// Metadata всё ещё может работать на сервере, так как сервис теперь
// не делает реальных запросов (он мокает данные).
// Если бы сервис делал запросы, metadata могла бы не работать без API.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  return {
    title: event ? `Событие ${event.code}` : "Событие не найдено",
  };
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Просто передаем ID клиенту. Загрузка данных будет там.
  return <EventDetailsView eventId={id} />;
}