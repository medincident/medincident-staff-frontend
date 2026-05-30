import { Metadata } from "next";
import { CapaView } from "@/app/(main)/admin/capa/view";

export const metadata: Metadata = {
  title: "Корректирующие мероприятия",
  description: "Учёт корректирующих и предупреждающих действий (CAPA) по приказу № 785н",
};

export default function CapaPage() {
  return <CapaView />;
}
