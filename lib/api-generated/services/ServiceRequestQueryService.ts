/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetServiceRequestHistoryResponse } from '../models/v1GetServiceRequestHistoryResponse';
import type { v1GetServiceRequestResponse } from '../models/v1GetServiceRequestResponse';
import type { v1ListServiceRequestsByIncidentResponse } from '../models/v1ListServiceRequestsByIncidentResponse';
import type { v1ListServiceRequestsResponse } from '../models/v1ListServiceRequestsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceRequestQueryService {
    /**
     * @param incidentId
     * @param limit
     * @param after
     * @returns v1ListServiceRequestsByIncidentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryListServiceRequestsByIncident(
        incidentId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListServiceRequestsByIncidentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incidents/{incidentId}/service-requests',
            path: {
                'incidentId': incidentId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`service_request_list_limit_out_of_range\` — limit exceeds the allowed maximum.
                - \`request_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_query_incident_not_found\` — incident with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @returns v1ListServiceRequestsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryListServiceRequests(
        organizationId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListServiceRequestsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/service-requests',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`service_request_list_limit_out_of_range\` — limit exceeds the allowed maximum.
                - \`request_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetServiceRequestResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryGetServiceRequest(
        id: string,
    ): CancelablePromise<v1GetServiceRequestResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/service-requests/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_query_not_found\` — service request with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param serviceRequestId
     * @returns v1GetServiceRequestHistoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryGetServiceRequestHistory(
        serviceRequestId: string,
    ): CancelablePromise<v1GetServiceRequestHistoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/service-requests/{serviceRequestId}/history',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_query_not_found\` — service request with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
