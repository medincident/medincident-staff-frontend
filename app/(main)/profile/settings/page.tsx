import { Metadata } from "next";
import { SettingsView } from "@/app/(main)/profile/settings/view";

export const metadata: Metadata = {
  title: "Настройки уведомлений | Профиль",
  description: "Управление режимом тишины и email оповещениями",
};

export default function SettingsPage() {
  return <SettingsView />;
}