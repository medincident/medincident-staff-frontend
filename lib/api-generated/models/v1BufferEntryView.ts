/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1BufferStatus } from './v1BufferStatus';
import type { v1PatientStatus } from './v1PatientStatus';
export type v1BufferEntryView = {
    id?: string;
    organizationId?: string;
    patientZitadelUserId?: string;
    categoryId?: string;
    typeId?: string;
    description?: string;
    occurredAt?: string;
    status?: v1BufferStatus;
    publishedIncidentId?: string;
    createdAt?: string;
    updatedAt?: string;
    /**
     * Populated only for patient callers.
     */
    patientStatus?: v1PatientStatus;
    summary?: string;
    priority?: string;
};

