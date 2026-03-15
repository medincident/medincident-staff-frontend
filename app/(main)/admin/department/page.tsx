import { Metadata } from "next";
import { DepartmentView } from "@/app/(main)/admin/department/view";

export const metadata: Metadata = {
  title: "Настройки отделения",
  description: "Управление руководством и структурой отделения",
};

export default function DepartmentSettingsPage() {
  return <DepartmentView />;
}