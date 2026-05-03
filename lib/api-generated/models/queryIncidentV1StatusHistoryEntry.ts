/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryIncidentV1IncidentStatus } from './queryIncidentV1IncidentStatus';
import type { v1ActorView } from './v1ActorView';
export type queryIncidentV1StatusHistoryEntry = {
    id?: string;
    oldStatus?: queryIncidentV1IncidentStatus;
    newStatus?: queryIncidentV1IncidentStatus;
    actor?: v1ActorView;
    changedAt?: string;
};

