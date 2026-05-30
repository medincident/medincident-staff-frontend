"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useActiveOrgId } from "./active-org-context";
import { useMyIdentity } from "./use-my-identity";
import { useMyOrgRole } from "./use-my-org-role";
import { useMyClinicRole } from "./use-my-clinic-role";
import { useMyDeptRole } from "./use-my-dept-role";
import { getMyEmployeeInOrg } from "./get-my-employee";

// Ролевые флаги и permissions для UI.
// Композиция: SelfQuery {Identity, OrgRole, ClinicRole, DeptRole} + employment в активной орге.
//
// Сопоставление с моделью продуктовых ролей:
//   System admin                 → isSystemAdmin
//   Org admin                    → isOrgAdmin
//   Org head (рук-ль организации)→ isOrgHead    (read-only org-wide)
//   Org dispatcher (заявки + НС) → isOrgDispatcher
//   Зав клиникой                 → isClinicHead
//   Руководитель отделения       → isDepartmentResponsible
//   Работник                     → isMember
//
// TODO бэкенда (флаги пока всегда false):
//   - Гость
//   - Ответственный за конкретный тип НС
//   - Ответственный за конкретный тип заявки
//   - Раздельные диспетчеры (заявки vs НС) — сейчас один общий
//
// Когда бэк появится, надо:
//   1) добавить запросы в соответствующие use-my-*-role хуки или сюда;
//   2) поменять флаги ниже с `false` на реальное значение.

export interface Permissions {
  // ─── Сырые роли ───────────────────────────────────────────────
  isSystemAdmin: boolean;
  isOrgAdmin: boolean;
  isOrgHead: boolean;
  isOrgDispatcher: boolean;
  isClinicHead: boolean;
  isDepartmentResponsible: boolean;
  /** Любой сотрудник в активной орге. */
  isMember: boolean;

  // ─── TODO бэка ────────────────────────────────────────────────
  isGuest: boolean;
  isIncidentTypeResponsible: boolean;
  isRequestTypeResponsible: boolean;

  // ─── Заявки ───────────────────────────────────────────────────
  /** Видеть все заявки в орге. */
  canSeeAllRequests: boolean;
  /** Видеть заявки своей клиники. */
  canSeeClinicRequests: boolean;
  /** Видеть заявки своего отделения. */
  canSeeDepartmentRequests: boolean;
  /** Видеть свои заявки. */
  canSeeOwnRequests: boolean;
  /** Создавать заявку. */
  canCreateRequest: boolean;
  /** Назначать исполнителя / менять статус. */
  canAssignRequestExecutor: boolean;

  // ─── Нежелательные события ────────────────────────────────────
  canSeeAllIncidents: boolean;
  canSeeClinicIncidents: boolean;
  canSeeDepartmentIncidents: boolean;
  canSeeOwnIncidents: boolean;
  canCreateIncident: boolean;
  canAssignIncidentResponsible: boolean;

  // ─── Управление ───────────────────────────────────────────────
  /** /admin/organizations — только sysadmin. */
  canManageOrganizations: boolean;
  /** /admin/structure — клиники, отделения. */
  canManageOrgStructure: boolean;
  /** /admin/users. */
  canManageOrgUsers: boolean;
  /** /admin/department — настройки своего отделения. */
  canManageDepartmentSettings: boolean;
  /** /admin/classifier. */
  canManageClassifiers: boolean;
  /** /admin/capa — корректирующие/предупреждающие мероприятия (785н). */
  canManageCapa: boolean;
  /** /admin/announcements. */
  canManageAnnouncements: boolean;

  // ─── Просмотр ─────────────────────────────────────────────────
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canViewAnnouncements: boolean;

  // ─── Мета ─────────────────────────────────────────────────────
  /** true пока хоть один из источников ещё не отдал ответ. */
  isLoading: boolean;
  /** true, если у юзера вообще есть какая-то «полезная» роль. */
  hasAnyRole: boolean;
}

const EMPTY: Permissions = {
  isSystemAdmin: false,
  isOrgAdmin: false,
  isOrgHead: false,
  isOrgDispatcher: false,
  isClinicHead: false,
  isDepartmentResponsible: false,
  isMember: false,
  isGuest: false,
  isIncidentTypeResponsible: false,
  isRequestTypeResponsible: false,
  canSeeAllRequests: false,
  canSeeClinicRequests: false,
  canSeeDepartmentRequests: false,
  canSeeOwnRequests: false,
  canCreateRequest: false,
  canAssignRequestExecutor: false,
  canSeeAllIncidents: false,
  canSeeClinicIncidents: false,
  canSeeDepartmentIncidents: false,
  canSeeOwnIncidents: false,
  canCreateIncident: false,
  canAssignIncidentResponsible: false,
  canManageOrganizations: false,
  canManageOrgStructure: false,
  canManageOrgUsers: false,
  canManageDepartmentSettings: false,
  canManageClassifiers: false,
  canManageCapa: false,
  canManageAnnouncements: false,
  canViewReports: false,
  canViewAnalytics: false,
  canViewAnnouncements: false,
  isLoading: true,
  hasAnyRole: false,
};

export function usePermissions(): Permissions {
  const { data: session, status } = useSession();
  const { orgId, isResolving: orgResolving } = useActiveOrgId();
  const { identity, isLoading: identityLoading } = useMyIdentity();
  const { role: orgRole, isLoading: orgRoleLoading } = useMyOrgRole();

  const [empClinicId, setEmpClinicId] = useState<string | null>(null);
  const [empDeptId, setEmpDeptId] = useState<string | null>(null);
  const [hasEmployment, setHasEmployment] = useState(false);
  const [empLoading, setEmpLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setEmpClinicId(null);
      setEmpDeptId(null);
      setHasEmployment(false);
      setEmpLoading(false);
      return;
    }
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId || !orgId) {
      setEmpClinicId(null);
      setEmpDeptId(null);
      setHasEmployment(false);
      setEmpLoading(false);
      return;
    }
    let cancelled = false;
    setEmpLoading(true);
    getMyEmployeeInOrg(userId, orgId)
      .then((emp) => {
        if (cancelled) return;
        setEmpClinicId(emp?.clinicId ?? null);
        setEmpDeptId(emp?.departmentId ?? null);
        setHasEmployment(!!emp);
      })
      .catch(() => {
        if (cancelled) return;
        setEmpClinicId(null);
        setEmpDeptId(null);
        setHasEmployment(false);
      })
      .finally(() => {
        if (!cancelled) setEmpLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status, orgId]);

  const { role: clinicRole, isLoading: clinicLoading } = useMyClinicRole(empClinicId);
  const { role: deptRole, isLoading: deptLoading } = useMyDeptRole(empDeptId);

  if (status === "loading" || orgResolving) return EMPTY;

  const isLoading =
    identityLoading || orgRoleLoading || empLoading || clinicLoading || deptLoading;

  // ── Сырые роли ──
  const isSystemAdmin = !!identity?.isSystemAdmin;
  const isOrgAdmin = orgRole.isOrgAdmin;
  const isOrgHead = orgRole.isOrgHead;
  const isOrgDispatcher = orgRole.isOrgDispatcher;
  const isClinicHead = clinicRole.isClinicHead;
  const isDepartmentResponsible = deptRole.isDepartmentResponsible;
  const isMember = hasEmployment;

  // TODO: появятся, когда бэк подвезёт.
  const isGuest = false;
  const isIncidentTypeResponsible = false;
  const isRequestTypeResponsible = false;

  // ── Скоупы (от широкого к узкому) ──
  // Видимость уровня орги: sysadmin или любая орг-роль.
  const orgWideRead = isSystemAdmin || isOrgAdmin || isOrgHead || isOrgDispatcher;
  const clinicWideRead = orgWideRead || isClinicHead;
  const deptWideRead = clinicWideRead || isDepartmentResponsible;

  return {
    isSystemAdmin,
    isOrgAdmin,
    isOrgHead,
    isOrgDispatcher,
    isClinicHead,
    isDepartmentResponsible,
    isMember,

    isGuest,
    isIncidentTypeResponsible,
    isRequestTypeResponsible,

    canSeeAllRequests: orgWideRead,
    canSeeClinicRequests: clinicWideRead,
    canSeeDepartmentRequests: deptWideRead,
    canSeeOwnRequests: isMember || isSystemAdmin,
    canCreateRequest: isMember,
    canAssignRequestExecutor: deptWideRead,

    canSeeAllIncidents: orgWideRead,
    canSeeClinicIncidents: clinicWideRead,
    canSeeDepartmentIncidents: deptWideRead,
    canSeeOwnIncidents: isMember || isSystemAdmin,
    canCreateIncident: isMember,
    canAssignIncidentResponsible: deptWideRead,

    canManageOrganizations: isSystemAdmin,
    canManageOrgStructure: isSystemAdmin || isOrgAdmin,
    canManageOrgUsers: isSystemAdmin || isOrgAdmin,
    // Настройки отделения — sysadmin/admin орги (любое отделение) или
    // тот, кто реально руководит этим отделением/клиникой.
    canManageDepartmentSettings:
      isSystemAdmin || isOrgAdmin || isClinicHead || isDepartmentResponsible,
    canManageClassifiers: isSystemAdmin || isOrgAdmin,
    // CAPA — управление качеством (785н). Доступно всем уровням руководства,
    // которые могут принимать и контролировать корректирующие мероприятия.
    canManageCapa:
      isSystemAdmin ||
      isOrgAdmin ||
      isOrgHead ||
      isClinicHead ||
      isDepartmentResponsible,
    canManageAnnouncements: isSystemAdmin || isOrgAdmin,

    canViewReports: !isGuest,
    canViewAnalytics: true,
    canViewAnnouncements: true,

    isLoading,
    hasAnyRole:
      isSystemAdmin ||
      isOrgAdmin ||
      isOrgHead ||
      isOrgDispatcher ||
      isClinicHead ||
      isDepartmentResponsible ||
      isMember,
  };
}

export type PermissionKey = keyof Omit<Permissions, "isLoading" | "hasAnyRole">;
