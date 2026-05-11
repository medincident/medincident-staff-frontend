/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetMyClinicRoleResponse } from '../models/v1GetMyClinicRoleResponse';
import type { v1GetMyDepartmentRoleResponse } from '../models/v1GetMyDepartmentRoleResponse';
import type { v1GetMyEmploymentResponse } from '../models/v1GetMyEmploymentResponse';
import type { v1GetMyIdentityResponse } from '../models/v1GetMyIdentityResponse';
import type { v1GetMyOrganizationRoleResponse } from '../models/v1GetMyOrganizationRoleResponse';
import type { v1ListMyOrganizationsResponse } from '../models/v1ListMyOrganizationsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SelfQueryService {
    /**
     * GetMyIdentity returns whether the caller is a system administrator.
     * @returns v1GetMyIdentityResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static selfQueryGetMyIdentity(): CancelablePromise<v1GetMyIdentityResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/me',
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * GetMyClinicRole returns whether the caller is the clinic head of
     * the given clinic. Returns NOT_FOUND when the caller is not an
     * active employee of that clinic.
     * @param clinicId
     * @returns v1GetMyClinicRoleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static selfQueryGetMyClinicRole(
        clinicId: string,
    ): CancelablePromise<v1GetMyClinicRoleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/me/clinics/{clinicId}/role',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`self_clinic_role_not_found\` — caller is not an active employee of the given clinic.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * GetMyDepartmentRole returns whether the caller holds the
     * department-responsible role for the given department. Returns
     * NOT_FOUND when the caller is not an active employee of that
     * department.
     * @param departmentId
     * @returns v1GetMyDepartmentRoleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static selfQueryGetMyDepartmentRole(
        departmentId: string,
    ): CancelablePromise<v1GetMyDepartmentRoleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/me/departments/{departmentId}/role',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`self_dept_role_not_found\` — caller is not an active employee of the given department.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * ListMyOrganizations returns every organization where the caller
     * has an active (non-terminated) employee record.
     * @returns v1ListMyOrganizationsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static selfQueryListMyOrganizations(): CancelablePromise<v1ListMyOrganizationsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/me/organizations',
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * GetMyEmployment returns the caller's employee card in the given
     * organization. Returns NOT_FOUND when the caller is not an active
     * employee of that organization.
     * @param organizationId
     * @returns v1GetMyEmploymentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static selfQueryGetMyEmployment(
        organizationId: string,
    ): CancelablePromise<v1GetMyEmploymentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/me/organizations/{organizationId}/employment',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`self_employment_not_found\` — caller is not an active employee of the given organization.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * GetMyOrganizationRole returns the caller's named roles in the
     * given organization. Returns NOT_FOUND when the caller is not an
     * active employee of that organization.
     * @param organizationId
     * @returns v1GetMyOrganizationRoleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static selfQueryGetMyOrganizationRole(
        organizationId: string,
    ): CancelablePromise<v1GetMyOrganizationRoleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/me/organizations/{organizationId}/role',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`self_org_role_not_found\` — caller is not an active employee of the given organization.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
