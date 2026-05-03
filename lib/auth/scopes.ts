export const SCOPES = {
  SYSTEM_ADMIN: "system_admin",
  ORG_HEAD: "org_head",
  ORG_ADMIN: "org_admin",
  ORG_DISPATCHER: "org_dispatcher",
  CLINIC_HEAD: "clinic_head",
  DEPT_RESPONSIBLE: "dept_responsible",
  EMPLOYEE: "employee",
} as const;

export type Scope = (typeof SCOPES)[keyof typeof SCOPES];
