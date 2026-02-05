import { Metadata } from "next";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = {
  title: "Отчёты и аналитика",
  description: "Сводная статистика работы клиники",
};

export default function ReportsPage() {
  return <ReportsView />;
}