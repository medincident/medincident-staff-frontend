/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryIncidentV1IncidentPriority } from './queryIncidentV1IncidentPriority';
import type { v1ActorView } from './v1ActorView';
export type v1PriorityHistoryEntry = {
    id?: string;
    oldPriority?: queryIncidentV1IncidentPriority;
    newPriority?: queryIncidentV1IncidentPriority;
    actor?: v1ActorView;
    changedAt?: string;
};

