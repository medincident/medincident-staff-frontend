/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1DepartmentCount } from './v1DepartmentCount';
import type { v1RequestStatusBreakdown } from './v1RequestStatusBreakdown';
import type { v1ResolutionStats } from './v1ResolutionStats';
import type { v1TypeCount } from './v1TypeCount';
export type v1RequestSummary = {
    total?: string;
    byStatus?: v1RequestStatusBreakdown;
    linked?: string;
    unlinked?: string;
    completion?: v1ResolutionStats;
    topTypes?: Array<v1TypeCount>;
    topDepartments?: Array<v1DepartmentCount>;
};

