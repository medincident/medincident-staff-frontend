import { Metadata } from "next";
import { OrganizationsView } from "@/app/(main)/admin/organization/view";

export const metadata: Metadata = {
  title: "Организации",
  description: "Глобальное управление медицинскими сетями и руководителями",
};

export default function OrganizationsPage() {
  return <OrganizationsView />;
}