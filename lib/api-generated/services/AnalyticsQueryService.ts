/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetSnapshotResponse } from '../models/v1GetSnapshotResponse';
import type { v1GetSummaryResponse } from '../models/v1GetSummaryResponse';
import type { v1GetTimeSeriesResponse } from '../models/v1GetTimeSeriesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnalyticsQueryService {
    /**
     * @param organizationId
     * @param from
     * @param to
     * @param clinicId
     * @param departmentId
     * @param includePatientBuffer
     * @returns v1GetSnapshotResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static analyticsQueryGetSnapshot(
        organizationId?: string,
        from?: string,
        to?: string,
        clinicId?: string,
        departmentId?: string,
        includePatientBuffer?: boolean,
    ): CancelablePromise<v1GetSnapshotResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`analytics_org_not_found\` — organization with the given ID does not exist.
                - \`analytics_clinic_not_found\` — clinic with the given ID does not exist.
                - \`analytics_dept_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
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
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static analyticsQueryGetSummary(
        organizationId?: string,
        from?: string,
        to?: string,
        clinicId?: string,
        departmentId?: string,
    ): CancelablePromise<v1GetSummaryResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`analytics_org_not_found\` — organization with the given ID does not exist.
                - \`analytics_clinic_not_found\` — clinic with the given ID does not exist.
                - \`analytics_dept_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
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
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static analyticsQueryGetTimeSeries(
        organizationId?: string,
        from?: string,
        to?: string,
        clinicId?: string,
        departmentId?: string,
        granularity: 'TIME_SERIES_GRANULARITY_UNSPECIFIED' | 'TIME_SERIES_GRANULARITY_DAY' | 'TIME_SERIES_GRANULARITY_WEEK' | 'TIME_SERIES_GRANULARITY_MONTH' = 'TIME_SERIES_GRANULARITY_UNSPECIFIED',
    ): CancelablePromise<v1GetTimeSeriesResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`analytics_org_not_found\` — organization with the given ID does not exist.
                - \`analytics_clinic_not_found\` — clinic with the given ID does not exist.
                - \`analytics_dept_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
