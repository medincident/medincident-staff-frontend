/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgStructureCommandServiceCreateClinicBody } from '../models/OrgStructureCommandServiceCreateClinicBody';
import type { OrgStructureCommandServiceCreateDepartmentBody } from '../models/OrgStructureCommandServiceCreateDepartmentBody';
import type { OrgStructureCommandServiceUpdateClinicDetailsBody } from '../models/OrgStructureCommandServiceUpdateClinicDetailsBody';
import type { OrgStructureCommandServiceUpdateClinicPhysicalAddressBody } from '../models/OrgStructureCommandServiceUpdateClinicPhysicalAddressBody';
import type { OrgStructureCommandServiceUpdateDepartmentDetailsBody } from '../models/OrgStructureCommandServiceUpdateDepartmentDetailsBody';
import type { OrgStructureCommandServiceUpdateOrganizationDetailsBody } from '../models/OrgStructureCommandServiceUpdateOrganizationDetailsBody';
import type { OrgStructureCommandServiceUpdateOrganizationLegalAddressBody } from '../models/OrgStructureCommandServiceUpdateOrganizationLegalAddressBody';
import type { v1CreateClinicResponse } from '../models/v1CreateClinicResponse';
import type { v1CreateDepartmentResponse } from '../models/v1CreateDepartmentResponse';
import type { v1CreateOrganizationRequest } from '../models/v1CreateOrganizationRequest';
import type { v1CreateOrganizationResponse } from '../models/v1CreateOrganizationResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1UpdateClinicDetailsResponse } from '../models/v1UpdateClinicDetailsResponse';
import type { v1UpdateClinicPhysicalAddressResponse } from '../models/v1UpdateClinicPhysicalAddressResponse';
import type { v1UpdateDepartmentDetailsResponse } from '../models/v1UpdateDepartmentDetailsResponse';
import type { v1UpdateOrganizationDetailsResponse } from '../models/v1UpdateOrganizationDetailsResponse';
import type { v1UpdateOrganizationLegalAddressResponse } from '../models/v1UpdateOrganizationLegalAddressResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrgStructureCommandService {
    /**
     * @param clinicId
     * @param body
     * @returns v1CreateDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandCreateDepartment(
        clinicId: string,
        body: OrgStructureCommandServiceCreateDepartmentBody,
    ): CancelablePromise<v1CreateDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/departments',
            path: {
                'clinicId': clinicId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_clinic_not_found\` — clinic with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param body
     * @returns v1UpdateClinicDetailsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandUpdateClinicDetails(
        clinicId: string,
        body: OrgStructureCommandServiceUpdateClinicDetailsBody,
    ): CancelablePromise<v1UpdateClinicDetailsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/clinics/{clinicId}/details',
            path: {
                'clinicId': clinicId,
            },
            body: body,
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
     * @param clinicId
     * @param body
     * @returns v1UpdateClinicPhysicalAddressResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandUpdateClinicPhysicalAddress(
        clinicId: string,
        body: OrgStructureCommandServiceUpdateClinicPhysicalAddressBody,
    ): CancelablePromise<v1UpdateClinicPhysicalAddressResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/clinics/{clinicId}/physical-address',
            path: {
                'clinicId': clinicId,
            },
            body: body,
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
     * @param departmentId
     * @param body
     * @returns v1UpdateDepartmentDetailsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandUpdateDepartmentDetails(
        departmentId: string,
        body: OrgStructureCommandServiceUpdateDepartmentDetailsBody,
    ): CancelablePromise<v1UpdateDepartmentDetailsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/departments/{departmentId}/details',
            path: {
                'departmentId': departmentId,
            },
            body: body,
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
     * @param body
     * @returns v1CreateOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandCreateOrganization(
        body: v1CreateOrganizationRequest,
    ): CancelablePromise<v1CreateOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations',
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param body
     * @returns v1CreateClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandCreateClinic(
        organizationId: string,
        body: OrgStructureCommandServiceCreateClinicBody,
    ): CancelablePromise<v1CreateClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/clinics',
            path: {
                'organizationId': organizationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_organization_not_found\` — organization with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param body
     * @returns v1UpdateOrganizationDetailsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandUpdateOrganizationDetails(
        organizationId: string,
        body: OrgStructureCommandServiceUpdateOrganizationDetailsBody,
    ): CancelablePromise<v1UpdateOrganizationDetailsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/organizations/{organizationId}/details',
            path: {
                'organizationId': organizationId,
            },
            body: body,
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
     * @param body
     * @returns v1UpdateOrganizationLegalAddressResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandUpdateOrganizationLegalAddress(
        organizationId: string,
        body: OrgStructureCommandServiceUpdateOrganizationLegalAddressBody,
    ): CancelablePromise<v1UpdateOrganizationLegalAddressResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/organizations/{organizationId}/legal-address',
            path: {
                'organizationId': organizationId,
            },
            body: body,
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
}
