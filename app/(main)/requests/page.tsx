import { Metadata } from "next";
import { RequestsListView } from "@/app/(main)/requests/view";

export const metadata: Metadata = {
  title: "Заявки",
  description: "Список всех технических заявок и обращений",
};

export default function RequestsListPage() {
  return <RequestsListView />;
}