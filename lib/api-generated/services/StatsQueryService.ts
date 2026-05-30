/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetClinicStatsResponse } from '../models/v1GetClinicStatsResponse';
import type { v1GetDepartmentStatsResponse } from '../models/v1GetDepartmentStatsResponse';
import type { v1GetOrganizationStatsResponse } from '../models/v1GetOrganizationStatsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatsQueryService {
    /**
     * @param clinicId
     * @returns v1GetClinicStatsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static statsQueryGetClinicStats(
        clinicId: string,
    ): CancelablePromise<v1GetClinicStatsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/stats',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`stats_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param departmentId
     * @returns v1GetDepartmentStatsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static statsQueryGetDepartmentStats(
        departmentId: string,
    ): CancelablePromise<v1GetDepartmentStatsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/stats',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`stats_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param organizationId
     * @returns v1GetOrganizationStatsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static statsQueryGetOrganizationStats(
        organizationId: string,
    ): CancelablePromise<v1GetOrganizationStatsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/stats',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`stats_load_failed\` — database query failed.`,
            },
        });
    }
}
