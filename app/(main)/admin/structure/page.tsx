import { Metadata } from "next";
import { StructureView } from "@/app/(main)/admin/structure/view";
import { RoleGate } from "@/components/auth/role-gate";
import { SCOPES } from "@/lib/auth/scopes";

export const metadata: Metadata = {
  title: "Структура организации",
  description: "Управление клиниками, филиалами и отделениями",
};

export default function StructurePage() {
  return (
    <RoleGate allowedScopes={[SCOPES.SYSTEM_ADMIN, SCOPES.ORG_ADMIN]} fallback={<div className="p-8 text-center text-muted-foreground">Доступ запрещен</div>}>
      <StructureView />
    </RoleGate>
  );
}