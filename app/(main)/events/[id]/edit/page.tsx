import { Metadata } from "next";
import { EventForm } from "@/components/events/event-form";
import { eventsDb } from "@/lib/mock-db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  const event = eventsDb.find((e) => e.id === id);
  
  return { title: event ? `Редактирование ${event.code}` : "Событие не найдено" };
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventForm eventId={id} />;
}