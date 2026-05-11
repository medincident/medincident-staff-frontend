/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncidentCommandServiceUpdateIncidentDescriptionBody } from '../models/IncidentCommandServiceUpdateIncidentDescriptionBody';
import type { IncidentCommandServiceUpdateIncidentPriorityBody } from '../models/IncidentCommandServiceUpdateIncidentPriorityBody';
import type { IncidentCommandServiceUpdateIncidentStatusBody } from '../models/IncidentCommandServiceUpdateIncidentStatusBody';
import type { v1CancelIncidentResponse } from '../models/v1CancelIncidentResponse';
import type { v1CreateIncidentRequest } from '../models/v1CreateIncidentRequest';
import type { v1CreateIncidentResponse } from '../models/v1CreateIncidentResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1ReopenIncidentResponse } from '../models/v1ReopenIncidentResponse';
import type { v1UpdateIncidentDescriptionResponse } from '../models/v1UpdateIncidentDescriptionResponse';
import type { v1UpdateIncidentPriorityResponse } from '../models/v1UpdateIncidentPriorityResponse';
import type { v1UpdateIncidentStatusResponse } from '../models/v1UpdateIncidentStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentCommandService {
    /**
     * @param body
     * @returns v1CreateIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandCreateIncident(
        body: v1CreateIncidentRequest,
    ): CancelablePromise<v1CreateIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incidents',
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_department_not_found\` — department with the given ID does not exist.
                - \`incident_category_not_found\` — incident category with the given ID does not exist.
                - \`incident_type_not_found\` — incident type with the given ID does not exist.
                - \`incident_employee_not_found\` — registrar employee not found.
                - \`incident_registrar_user_not_found\` — registrar's user projection record not found.`,
                422: `Failed precondition. Error codes:
                - \`incident_category_inactive\` — the selected category is inactive.
                - \`incident_type_inactive\` — the selected type is inactive.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param incidentId
     * @param body
     * @returns v1UpdateIncidentDescriptionResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandUpdateIncidentDescription(
        incidentId: string,
        body: IncidentCommandServiceUpdateIncidentDescriptionBody,
    ): CancelablePromise<v1UpdateIncidentDescriptionResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incidents/{incidentId}/description',
            path: {
                'incidentId': incidentId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_not_found\` — incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_frozen\` — incident is frozen and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param incidentId
     * @param body
     * @returns v1UpdateIncidentPriorityResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandUpdateIncidentPriority(
        incidentId: string,
        body: IncidentCommandServiceUpdateIncidentPriorityBody,
    ): CancelablePromise<v1UpdateIncidentPriorityResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incidents/{incidentId}/priority',
            path: {
                'incidentId': incidentId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_not_found\` — incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_frozen\` — incident is frozen and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param incidentId
     * @param body
     * @returns v1UpdateIncidentStatusResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandUpdateIncidentStatus(
        incidentId: string,
        body: IncidentCommandServiceUpdateIncidentStatusBody,
    ): CancelablePromise<v1UpdateIncidentStatusResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incidents/{incidentId}/status',
            path: {
                'incidentId': incidentId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_not_found\` — incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_invalid_status_transition\` — the requested status transition is not allowed.
                - \`incident_frozen\` — incident is frozen and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param incidentId
     * @returns v1CancelIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandCancelIncident(
        incidentId: string,
    ): CancelablePromise<v1CancelIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incidents/{incidentId}:cancel',
            path: {
                'incidentId': incidentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_not_found\` — incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_not_cancellable\` — incident is not in a cancellable status.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param incidentId
     * @returns v1ReopenIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandReopenIncident(
        incidentId: string,
    ): CancelablePromise<v1ReopenIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incidents/{incidentId}:reopen',
            path: {
                'incidentId': incidentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_not_found\` — incident with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_not_reopenable\` — incident cannot be reopened from its current status.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
