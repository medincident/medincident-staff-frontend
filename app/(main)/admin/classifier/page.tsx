import { Metadata } from "next";
import { ClassifierView } from "@/app/(main)/admin/classifier/view";

export const metadata: Metadata = {
  title: "Классификатор событий",
  description: "Управление справочником категорий и типов инцидентов",
};

export default function ClassifierPage() {
  return <ClassifierView />;
}