import { Metadata } from "next";
import { NotificationSettingsView } from "@/app/(main)/notifications/settings/view";

export const metadata: Metadata = {
  title: "Настройки уведомлений",
  description: "Управление push, email и тихими часами",
};

export default function NotificationSettingsPage() {
  return <NotificationSettingsView />;
}
