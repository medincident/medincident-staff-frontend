import { Metadata } from "next";
import { StructureView } from "@/app/(main)/admin/structure/view";

export const metadata: Metadata = {
  title: "Структура организации",
  description: "Управление клиниками, филиалами и отделениями",
};

export default function StructurePage() {
  return <StructureView />;
}