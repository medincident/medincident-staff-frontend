import { Metadata } from "next";
import { EventDetailsView } from "@/app/(main)/events/[id]/view";
import { getEventById } from "@/lib/services/events";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  return {
    title: event ? `Событие ${event.code}` : "Событие не найдено",
  };
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailsView eventId={id} />;
}