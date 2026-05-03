/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1CategoryCount } from './v1CategoryCount';
import type { v1DepartmentCount } from './v1DepartmentCount';
import type { v1IncidentPriorityBreakdown } from './v1IncidentPriorityBreakdown';
import type { v1IncidentSourceBreakdown } from './v1IncidentSourceBreakdown';
import type { v1IncidentStatusBreakdown } from './v1IncidentStatusBreakdown';
import type { v1ResolutionStats } from './v1ResolutionStats';
import type { v1TypeCount } from './v1TypeCount';
export type v1IncidentSummary = {
    total?: string;
    byStatus?: v1IncidentStatusBreakdown;
    byPriority?: v1IncidentPriorityBreakdown;
    bySource?: v1IncidentSourceBreakdown;
    reopened?: string;
    withLinkedRequests?: string;
    resolution?: v1ResolutionStats;
    topCategories?: Array<v1CategoryCount>;
    topTypes?: Array<v1TypeCount>;
    topDepartments?: Array<v1DepartmentCount>;
};

