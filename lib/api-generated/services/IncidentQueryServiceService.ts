/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
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
export class IncidentQueryServiceService {
    /**
     * @param id
     * @returns v1GetIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceGetIncident(
        id: string,
    ): CancelablePromise<v1GetIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/incidents/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param incidentId
     * @returns v1GetIncidentHistoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceGetIncidentHistory(
        incidentId: string,
    ): CancelablePromise<v1GetIncidentHistoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/incidents/{incidentId}/history',
            path: {
                'incidentId': incidentId,
            },
        });
    }
    /**
     * @param limit
     * @param offset
     * @returns v1ListMyIncidentsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceListMyIncidents(
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListMyIncidentsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/incidents:mine',
            query: {
                'limit': limit,
                'offset': offset,
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
     * @param offset
     * @returns v1ListIncidentsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceListIncidents(
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
        offset?: number,
    ): CancelablePromise<v1ListIncidentsResponse | rpcStatus> {
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
                'offset': offset,
            },
        });
    }
    /**
     * @param organizationId
     * @param statuses
     * @param limit
     * @param offset
     * @returns v1ListBufferEntriesResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceListBufferEntries(
        organizationId: string,
        statuses?: Array<string>,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListBufferEntriesResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/organizations/{organizationId}/patient-incidents',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'statuses': statuses,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * Buffer reads.
     * @param id
     * @returns v1GetBufferEntryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceGetBufferEntry(
        id: string,
    ): CancelablePromise<v1GetBufferEntryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/patient-incidents/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param limit
     * @param offset
     * @returns v1ListMyBufferEntriesResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentQueryServiceListMyBufferEntries(
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListMyBufferEntriesResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/patient-incidents:mine',
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
}
