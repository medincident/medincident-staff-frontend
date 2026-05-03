import { Metadata } from "next";
import { OrganizationsView } from "@/app/(main)/admin/organizations/view";
import { RoleGate } from "@/components/auth/role-gate";
import { SCOPES } from "@/lib/auth/scopes";

export const metadata: Metadata = {
  title: "Организации",
  description: "Глобальное управление медицинскими сетями и руководителями",
};

export default function OrganizationsPage() {
  return (
    <RoleGate allowedScopes={[SCOPES.SYSTEM_ADMIN]} fallback={<div className="p-8 text-center text-muted-foreground">Доступ запрещен</div>}>
      <OrganizationsView />
    </RoleGate>
  );
}