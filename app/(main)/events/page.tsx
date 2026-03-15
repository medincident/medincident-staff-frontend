import { Metadata } from "next";
import { EventsListView } from "@/app/(main)/events/view";

export const metadata: Metadata = {
  title: "Журнал событий",
  description: "Список всех зарегистрированных инцидентов и НС",
};

export default function EventsListPage() {
  return <EventsListView />;
}