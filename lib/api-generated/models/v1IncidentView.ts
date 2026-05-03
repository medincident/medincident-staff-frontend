/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryIncidentV1IncidentPriority } from './queryIncidentV1IncidentPriority';
import type { queryIncidentV1IncidentStatus } from './queryIncidentV1IncidentStatus';
import type { v1PatientStatus } from './v1PatientStatus';
import type { v1RegistrarView } from './v1RegistrarView';
/**
 * IncidentView is the unified payload. For patients only id, status,
 * patient_status, description and timestamps are populated.
 */
export type v1IncidentView = {
    id?: string;
    organizationId?: string;
    clinicId?: string;
    departmentId?: string;
    categoryId?: string;
    typeId?: string;
    status?: queryIncidentV1IncidentStatus;
    priority?: queryIncidentV1IncidentPriority;
    description?: string;
    patientOriginalDescription?: string;
    occurredAt?: string;
    createdAt?: string;
    updatedAt?: string;
    registrar?: v1RegistrarView;
    sourcePatientZitadelUserId?: string;
    sourceBufferId?: string;
    reopenedFromIncidentId?: string;
    /**
     * Populated only for patient callers.
     */
    patientStatus?: v1PatientStatus;
};

