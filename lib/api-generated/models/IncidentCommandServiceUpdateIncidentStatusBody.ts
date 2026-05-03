/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { commandIncidentV1IncidentStatus } from './commandIncidentV1IncidentStatus';
/**
 * UpdateIncidentStatus only handles forward transitions:
 * pending -> in_progress, in_progress -> done, in_progress -> rejected.
 * Cancellation by registrar uses CancelIncident.
 */
export type IncidentCommandServiceUpdateIncidentStatusBody = {
    newStatus: commandIncidentV1IncidentStatus;
};

