import { Metadata } from "next";
import { EventForm } from "@/components/events/event-form";

export const metadata: Metadata = {
  title: "Новое событие",
};

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto pb-20">
       <EventForm />
    </div>
  );
}