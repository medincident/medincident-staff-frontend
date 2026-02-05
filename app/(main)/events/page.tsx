import { Metadata } from "next";
import { EventsListView } from "@/components/events/events-list-view";

export const metadata: Metadata = {
  title: "Журнал событий",
  description: "Список всех зарегистрированных инцидентов и НС",
};

export default function EventsListPage() {
  return <EventsListView />;
}