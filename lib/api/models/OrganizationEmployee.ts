/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClinicBrief } from './ClinicBrief';
import type { DepartmentBrief } from './DepartmentBrief';
import type { UserBrief } from './UserBrief';
export type OrganizationEmployee = {
    user: UserBrief;
    clinic: ClinicBrief;
    department: DepartmentBrief;
    position?: string;
    assignedAt?: string;
};

