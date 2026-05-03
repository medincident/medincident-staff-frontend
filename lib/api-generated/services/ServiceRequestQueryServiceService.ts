/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetServiceRequestHistoryResponse } from '../models/v1GetServiceRequestHistoryResponse';
import type { v1GetServiceRequestResponse } from '../models/v1GetServiceRequestResponse';
import type { v1ListServiceRequestsByIncidentResponse } from '../models/v1ListServiceRequestsByIncidentResponse';
import type { v1ListServiceRequestsResponse } from '../models/v1ListServiceRequestsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceRequestQueryServiceService {
    /**
     * @param incidentId
     * @param limit
     * @param offset
     * @returns v1ListServiceRequestsByIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryServiceListServiceRequestsByIncident(
        incidentId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListServiceRequestsByIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incidents/{incidentId}/service-requests',
            path: {
                'incidentId': incidentId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListServiceRequestsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryServiceListServiceRequests(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListServiceRequestsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/service-requests',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetServiceRequestResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryServiceGetServiceRequest(
        id: string,
    ): CancelablePromise<v1GetServiceRequestResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/service-requests/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param serviceRequestId
     * @returns v1GetServiceRequestHistoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestQueryServiceGetServiceRequestHistory(
        serviceRequestId: string,
    ): CancelablePromise<v1GetServiceRequestHistoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/service-requests/{serviceRequestId}/history',
            path: {
                'serviceRequestId': serviceRequestId,
            },
        });
    }
}
