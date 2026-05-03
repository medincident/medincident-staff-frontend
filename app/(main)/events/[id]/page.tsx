import { Metadata } from "next";
import { EventDetailsView } from "@/app/(main)/events/[id]/view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Событие #${id.substring(0, 8)}`,
  };
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailsView eventId={id} />;
}