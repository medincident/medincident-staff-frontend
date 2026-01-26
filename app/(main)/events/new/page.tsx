import { EventForm } from "@/components/events/event-form";
import { headers } from "next/headers";

export default async function NewEventPage() {
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/classifier`, {
    method: "GET",
    headers: await headers(),
    cache: "no-store"
  });

  if (!res.ok) {
    return <div>Ошибка загрузки классификатора</div>;
  }

  const classifier = await res.json();

  return (
    <EventForm classifier={classifier} />
  );
}