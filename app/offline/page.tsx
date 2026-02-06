import { Metadata } from "next";
import { OfflineView } from "@/components/pwa/offline-view";

export const metadata: Metadata = {
  title: "Нет подключения",
  description: "Пожалуйста, проверьте ваше интернет-соединение",
};

export default function OfflinePage() {
  return <OfflineView />;
}