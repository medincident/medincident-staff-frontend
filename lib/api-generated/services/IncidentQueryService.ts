/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetBufferEntryResponse } from '../models/v1GetBufferEntryResponse';
import type { v1GetIncidentHistoryResponse } from '../models/v1GetIncidentHistoryResponse';
import type { v1GetIncidentResponse } from '../models/v1GetIncidentResponse';
import type { v1ListBufferEntriesResponse } from '../models/v1ListBufferEntriesResponse';
import type { v1ListIncidentsResponse } from '../models/v1ListIncidentsResponse';
import type { v1ListMyBufferEntriesResponse } from '../models/v1ListMyBufferEntriesResponse';
import type { v1ListMyIncidentsResponse } from '../models/v1ListMyIncidentsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentQueryService {
    /**
     * @param id
     * @returns v1GetIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryGetIncident(
        id: string,
    ): CancelablePromise<v1GetIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/incidents/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_query_not_found\` — incident with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param incidentId
     * @returns v1GetIncidentHistoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryGetIncidentHistory(
        incidentId: string,
    ): CancelablePromise<v1GetIncidentHistoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/incidents/{incidentId}/history',
            path: {
                'incidentId': incidentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_query_not_found\` — incident with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param limit
     * @param after
     * @returns v1ListMyIncidentsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryListMyIncidents(
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListMyIncidentsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/incidents:mine',
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param statuses
     * @param priorities
     * @param clinicId
     * @param departmentId
     * @param categoryId
     * @param typeId
     * @param occurredFrom RFC3339Nano
     * @param occurredTo
     * @param limit
     * @param after
     * @returns v1ListIncidentsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryListIncidents(
        organizationId: string,
        statuses?: Array<string>,
        priorities?: Array<string>,
        clinicId?: string,
        departmentId?: string,
        categoryId?: string,
        typeId?: string,
        occurredFrom?: string,
        occurredTo?: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListIncidentsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/organizations/{organizationId}/incidents',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'statuses': statuses,
                'priorities': priorities,
                'clinicId': clinicId,
                'departmentId': departmentId,
                'categoryId': categoryId,
                'typeId': typeId,
                'occurredFrom': occurredFrom,
                'occurredTo': occurredTo,
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param statuses
     * @param limit
     * @param after
     * @returns v1ListBufferEntriesResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryListBufferEntries(
        organizationId: string,
        statuses?: Array<string>,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListBufferEntriesResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/organizations/{organizationId}/patient-incidents',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'statuses': statuses,
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * Buffer reads.
     * @param id
     * @returns v1GetBufferEntryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryGetBufferEntry(
        id: string,
    ): CancelablePromise<v1GetBufferEntryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/patient-incidents/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`buffer_query_not_found\` — patient incident with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param limit
     * @param after
     * @returns v1ListMyBufferEntriesResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryListMyBufferEntries(
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListMyBufferEntriesResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/patient-incidents:mine',
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
