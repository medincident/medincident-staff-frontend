/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetSnapshotResponse } from '../models/v1GetSnapshotResponse';
import type { v1GetSummaryResponse } from '../models/v1GetSummaryResponse';
import type { v1GetTimeSeriesResponse } from '../models/v1GetTimeSeriesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnalyticsQueryServiceService {
    /**
     * @param organizationId
     * @param from
     * @param to
     * @param clinicId
     * @param departmentId
     * @param includePatientBuffer
     * @returns v1GetSnapshotResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static analyticsQueryServiceGetSnapshot(
        organizationId?: string,
        from?: string,
        to?: string,
        clinicId?: string,
        departmentId?: string,
        includePatientBuffer?: boolean,
    ): CancelablePromise<v1GetSnapshotResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/analytics/snapshot',
            query: {
                'organizationId': organizationId,
                'from': from,
                'to': to,
                'clinicId': clinicId,
                'departmentId': departmentId,
                'includePatientBuffer': includePatientBuffer,
            },
        });
    }
    /**
     * @param organizationId
     * @param from
     * @param to
     * @param clinicId
     * @param departmentId
     * @returns v1GetSummaryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static analyticsQueryServiceGetSummary(
        organizationId?: string,
        from?: string,
        to?: string,
        clinicId?: string,
        departmentId?: string,
    ): CancelablePromise<v1GetSummaryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/analytics/summary',
            query: {
                'organizationId': organizationId,
                'from': from,
                'to': to,
                'clinicId': clinicId,
                'departmentId': departmentId,
            },
        });
    }
    /**
     * @param organizationId
     * @param from
     * @param to
     * @param clinicId
     * @param departmentId
     * @param granularity
     * @returns v1GetTimeSeriesResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static analyticsQueryServiceGetTimeSeries(
        organizationId?: string,
        from?: string,
        to?: string,
        clinicId?: string,
        departmentId?: string,
        granularity: 'TIME_SERIES_GRANULARITY_UNSPECIFIED' | 'TIME_SERIES_GRANULARITY_DAY' | 'TIME_SERIES_GRANULARITY_WEEK' | 'TIME_SERIES_GRANULARITY_MONTH' = 'TIME_SERIES_GRANULARITY_UNSPECIFIED',
    ): CancelablePromise<v1GetTimeSeriesResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/analytics/timeseries',
            query: {
                'organizationId': organizationId,
                'from': from,
                'to': to,
                'clinicId': clinicId,
                'departmentId': departmentId,
                'granularity': granularity,
            },
        });
    }
}
