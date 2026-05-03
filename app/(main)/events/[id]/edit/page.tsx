import { Metadata } from "next";
import { EventForm } from "@/components/events/event-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  return { title: `Редактирование #${id.substring(0, 8)}` };
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventForm eventId={id} />;
}