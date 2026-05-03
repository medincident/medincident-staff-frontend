/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1EmployeeCardView } from './v1EmployeeCardView';
/**
 * RoleAssignment is a role row enriched with the denormalised card for
 * the holder and, when present, the deputy. Read-model callers use
 * this so they do not need to follow role lookups with N+1 GetEmployee
 * calls to render a name or email.
 */
export type v1RoleAssignment = {
    holder?: v1EmployeeCardView;
    deputy?: v1EmployeeCardView;
};

