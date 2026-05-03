import { Metadata } from "next";
import { UsersView } from "@/app/(main)/admin/users/view";
import { RoleGate } from "@/components/auth/role-gate";
import { SCOPES } from "@/lib/auth/scopes";

export const metadata: Metadata = {
  title: "Пользователи",
  description: "Управление сотрудниками и доступом",
};

export default function UsersPage() {
  return (
    <RoleGate allowedScopes={[SCOPES.SYSTEM_ADMIN, SCOPES.ORG_ADMIN]} fallback={<div className="p-8 text-center text-muted-foreground">Доступ запрещен</div>}>
      <UsersView />
    </RoleGate>
  );
}