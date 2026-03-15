import { Metadata } from "next";
import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/lib/services/events";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  return { title: event ? `Редактирование ${event.code}` : "Не найдено" };
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventForm eventId={id} />;
}