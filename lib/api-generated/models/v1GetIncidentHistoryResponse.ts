/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryIncidentV1StatusHistoryEntry } from './queryIncidentV1StatusHistoryEntry';
import type { v1PriorityHistoryEntry } from './v1PriorityHistoryEntry';
export type v1GetIncidentHistoryResponse = {
    statusHistory?: Array<queryIncidentV1StatusHistoryEntry>;
    priorityHistory?: Array<v1PriorityHistoryEntry>;
};

