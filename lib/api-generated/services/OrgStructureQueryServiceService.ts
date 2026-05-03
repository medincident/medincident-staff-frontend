/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CountClinicsByOrganizationResponse } from '../models/v1CountClinicsByOrganizationResponse';
import type { v1CountDepartmentsByClinicResponse } from '../models/v1CountDepartmentsByClinicResponse';
import type { v1CountOrganizationsResponse } from '../models/v1CountOrganizationsResponse';
import type { v1GetClinicResponse } from '../models/v1GetClinicResponse';
import type { v1GetDepartmentResponse } from '../models/v1GetDepartmentResponse';
import type { v1GetOrganizationResponse } from '../models/v1GetOrganizationResponse';
import type { v1ListClinicsByOrganizationResponse } from '../models/v1ListClinicsByOrganizationResponse';
import type { v1ListDepartmentsByClinicResponse } from '../models/v1ListDepartmentsByClinicResponse';
import type { v1ListOrganizationsResponse } from '../models/v1ListOrganizationsResponse';
import type { v1SearchOrganizationsResponse } from '../models/v1SearchOrganizationsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrgStructureQueryServiceService {
    /**
     * @param clinicId
     * @param limit
     * @param offset
     * @returns v1ListDepartmentsByClinicResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceListDepartmentsByClinic(
        clinicId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListDepartmentsByClinicResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/departments',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param clinicId
     * @returns v1CountDepartmentsByClinicResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceCountDepartmentsByClinic(
        clinicId: string,
    ): CancelablePromise<v1CountDepartmentsByClinicResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/departments:count',
            path: {
                'clinicId': clinicId,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetClinicResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceGetClinic(
        id: string,
    ): CancelablePromise<v1GetClinicResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetDepartmentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceGetDepartment(
        id: string,
    ): CancelablePromise<v1GetDepartmentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param limit
     * @param offset
     * @returns v1ListOrganizationsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceListOrganizations(
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListOrganizationsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations',
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceGetOrganization(
        id: string,
    ): CancelablePromise<v1GetOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListClinicsByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceListClinicsByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListClinicsByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/clinics',
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
     * @param organizationId
     * @returns v1CountClinicsByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceCountClinicsByOrganization(
        organizationId: string,
    ): CancelablePromise<v1CountClinicsByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/clinics:count',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * @returns v1CountOrganizationsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceCountOrganizations(): CancelablePromise<v1CountOrganizationsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations:count',
        });
    }
    /**
     * @param query
     * @param limit
     * @param offset
     * @returns v1SearchOrganizationsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryServiceSearchOrganizations(
        query?: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1SearchOrganizationsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations:search',
            query: {
                'query': query,
                'limit': limit,
                'offset': offset,
            },
        });
    }
}
