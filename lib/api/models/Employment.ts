/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClinicBrief } from './ClinicBrief';
import type { DepartmentBrief } from './DepartmentBrief';
import type { OrganizationBrief } from './OrganizationBrief';
export type Employment = {
    organization: OrganizationBrief;
    clinic: ClinicBrief;
    department: DepartmentBrief;
    /**
     * Position in the department
     */
    position?: string;
};

