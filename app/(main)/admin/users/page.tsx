import { Metadata } from "next";
import { UsersView } from "@/components/admin/users-view";

export const metadata: Metadata = {
  title: "Пользователи",
  description: "Управление сотрудниками и доступом",
};

export default function UsersPage() {
  return <UsersView />;
}