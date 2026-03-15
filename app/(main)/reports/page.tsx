import { Metadata } from "next";
import { ReportsView } from "@/app/(main)/reports/view";

export const metadata: Metadata = {
  title: "Отчёты и аналитика",
  description: "Сводная статистика работы клиники",
};

export default function ReportsPage() {
  return <ReportsView />;
}