/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1CountClinicsByOrganizationResponse } from '../models/v1CountClinicsByOrganizationResponse';
import type { v1CountDepartmentsByClinicResponse } from '../models/v1CountDepartmentsByClinicResponse';
import type { v1CountOrganizationsResponse } from '../models/v1CountOrganizationsResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
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
export class OrgStructureQueryService {
    /**
     * @param clinicId
     * @param limit
     * @param after
     * @param includeDeactivated
     * @returns v1ListDepartmentsByClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryListDepartmentsByClinic(
        clinicId: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListDepartmentsByClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/departments',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`orgstructure_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @returns v1CountDepartmentsByClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryCountDepartmentsByClinic(
        clinicId: string,
    ): CancelablePromise<v1CountDepartmentsByClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/departments:count',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`department_count_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryGetClinic(
        id: string,
    ): CancelablePromise<v1GetClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_not_found\` — clinic with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryGetDepartment(
        id: string,
    ): CancelablePromise<v1GetDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param limit
     * @param after Opaque pagination cursor returned as next_cursor from a previous
     * response. Omit or leave empty to start from the first page. An
     * invalid cursor is rejected with a domain error.
     * @param includeDeactivated
     * @returns v1ListOrganizationsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryListOrganizations(
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListOrganizationsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations',
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`orgstructure_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryGetOrganization(
        id: string,
    ): CancelablePromise<v1GetOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @param includeDeactivated
     * @returns v1ListClinicsByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryListClinicsByOrganization(
        organizationId: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListClinicsByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/clinics',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`orgstructure_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @returns v1CountClinicsByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryCountClinicsByOrganization(
        organizationId: string,
    ): CancelablePromise<v1CountClinicsByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/clinics:count',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`clinic_count_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @returns v1CountOrganizationsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQueryCountOrganizations(): CancelablePromise<v1CountOrganizationsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations:count',
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`organization_count_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param query
     * @param limit
     * @param after
     * @param includeDeactivated
     * @returns v1SearchOrganizationsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureQuerySearchOrganizations(
        query?: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1SearchOrganizationsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations:search',
            query: {
                'query': query,
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`orgstructure_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
