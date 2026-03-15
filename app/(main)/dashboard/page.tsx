import { Metadata } from "next";
import { DashboardView } from "@/app/(main)/dashboard/view";

export const metadata: Metadata = {
  title: "Главная",
};

export default function DashboardPage() {
  return <DashboardView />;
}