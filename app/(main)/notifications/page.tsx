import { Metadata } from "next";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = {
  title: "Уведомления",
  description: "История системных сообщений и событий",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}