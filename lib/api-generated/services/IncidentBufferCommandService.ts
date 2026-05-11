/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncidentBufferCommandServicePublishPatientIncidentBody } from '../models/IncidentBufferCommandServicePublishPatientIncidentBody';
import type { IncidentBufferCommandServiceUpdatePatientIncidentBody } from '../models/IncidentBufferCommandServiceUpdatePatientIncidentBody';
import type { v1CancelPatientIncidentResponse } from '../models/v1CancelPatientIncidentResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1PublishPatientIncidentResponse } from '../models/v1PublishPatientIncidentResponse';
import type { v1RejectPatientIncidentResponse } from '../models/v1RejectPatientIncidentResponse';
import type { v1SubmitPatientIncidentRequest } from '../models/v1SubmitPatientIncidentRequest';
import type { v1SubmitPatientIncidentResponse } from '../models/v1SubmitPatientIncidentResponse';
import type { v1UpdatePatientIncidentResponse } from '../models/v1UpdatePatientIncidentResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentBufferCommandService {
    /**
     * @param body
     * @returns v1SubmitPatientIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandSubmitPatientIncident(
        body: v1SubmitPatientIncidentRequest,
    ): CancelablePromise<v1SubmitPatientIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents',
            body: body,
            errors: {
                400: `Invalid input. Error codes:
                - \`buffer_occurred_at_invalid\` — the occurred_at timestamp is not a valid RFC3339 date.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`buffer_organization_not_found\` — organization with the given ID does not exist.
                - \`buffer_category_not_found\` — category with the given ID does not exist.
                - \`buffer_type_not_found\` — incident type with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`buffer_type_not_allowed_for_patients\` — the selected incident type is not available for patient submissions.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param bufferId
     * @param body
     * @returns v1UpdatePatientIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandUpdatePatientIncident(
        bufferId: string,
        body: IncidentBufferCommandServiceUpdatePatientIncidentBody,
    ): CancelablePromise<v1UpdatePatientIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/patient-incidents/{bufferId}',
            path: {
                'bufferId': bufferId,
            },
            body: body,
            errors: {
                400: `Invalid input. Error codes:
                - \`buffer_occurred_at_invalid\` — the occurred_at timestamp is not a valid RFC3339 date.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`buffer_not_patient_owner\` — caller is not the patient who submitted this incident.`,
                404: `Not found. Error codes:
                - \`buffer_not_found\` — patient incident with the given ID does not exist.
                - \`buffer_category_not_found\` — category with the given ID does not exist.
                - \`buffer_type_not_found\` — incident type with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`buffer_not_pending\` — patient incident is not in pending status and cannot be updated.
                - \`buffer_type_not_allowed_for_patients\` — the selected incident type is not available for patient submissions.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param bufferId
     * @returns v1CancelPatientIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandCancelPatientIncident(
        bufferId: string,
    ): CancelablePromise<v1CancelPatientIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents/{bufferId}:cancel',
            path: {
                'bufferId': bufferId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`buffer_not_patient_owner\` — caller is not the patient who submitted this incident.`,
                404: `Not found. Error codes:
                - \`buffer_not_found\` — patient incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`buffer_not_pending\` — patient incident is not in pending status and cannot be cancelled.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param bufferId
     * @param body
     * @returns v1PublishPatientIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandPublishPatientIncident(
        bufferId: string,
        body: IncidentBufferCommandServicePublishPatientIncidentBody,
    ): CancelablePromise<v1PublishPatientIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents/{bufferId}:publish',
            path: {
                'bufferId': bufferId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`buffer_not_found\` — patient incident with the given ID does not exist.
                - \`buffer_department_not_found\` — department with the given ID does not exist.
                - \`buffer_category_not_found\` — category with the given ID does not exist.
                - \`buffer_type_not_found\` — incident type with the given ID does not exist.
                - \`buffer_dispatcher_not_found\` — dispatcher employee not found.`,
                422: `Failed precondition. Error codes:
                - \`buffer_not_pending\` — patient incident is not in pending status and cannot be published.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param bufferId
     * @returns v1RejectPatientIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandRejectPatientIncident(
        bufferId: string,
    ): CancelablePromise<v1RejectPatientIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents/{bufferId}:reject',
            path: {
                'bufferId': bufferId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`buffer_not_found\` — patient incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`buffer_not_pending\` — patient incident is not in pending status and cannot be rejected.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
