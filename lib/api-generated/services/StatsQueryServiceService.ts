/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetClinicStatsResponse } from '../models/v1GetClinicStatsResponse';
import type { v1GetDepartmentStatsResponse } from '../models/v1GetDepartmentStatsResponse';
import type { v1GetOrganizationStatsResponse } from '../models/v1GetOrganizationStatsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatsQueryServiceService {
    /**
     * @param clinicId
     * @returns v1GetClinicStatsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static statsQueryServiceGetClinicStats(
        clinicId: string,
    ): CancelablePromise<v1GetClinicStatsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/stats',
            path: {
                'clinicId': clinicId,
            },
        });
    }
    /**
     * @param departmentId
     * @returns v1GetDepartmentStatsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static statsQueryServiceGetDepartmentStats(
        departmentId: string,
    ): CancelablePromise<v1GetDepartmentStatsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/stats',
            path: {
                'departmentId': departmentId,
            },
        });
    }
    /**
     * @param organizationId
     * @returns v1GetOrganizationStatsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static statsQueryServiceGetOrganizationStats(
        organizationId: string,
    ): CancelablePromise<v1GetOrganizationStatsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/stats',
            path: {
                'organizationId': organizationId,
            },
        });
    }
}
