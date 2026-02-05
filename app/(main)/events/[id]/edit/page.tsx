import { Metadata } from "next";
import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/lib/services/events";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // Metadata все еще может использовать сервис на сервере (так как он мокает данные)
  const event = await getEventById(id);
  return { title: event ? `Редактирование ${event.code}` : "Не найдено" };
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Мы не фечим данные здесь, просто передаем ID клиенту
  return <EventForm eventId={id} />;
}