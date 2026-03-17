/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddResponsibleRequest } from '../models/AddResponsibleRequest';
import type { Clinic } from '../models/Clinic';
import type { ClinicEmployeeListResponse } from '../models/ClinicEmployeeListResponse';
import type { ClinicListResponse } from '../models/ClinicListResponse';
import type { CreateClinicRequest } from '../models/CreateClinicRequest';
import type { IneligibilityReasonCode } from '../models/IneligibilityReasonCode';
import type { ResponsibleCandidateListResponse } from '../models/ResponsibleCandidateListResponse';
import type { ResponsibleListResponse } from '../models/ResponsibleListResponse';
import type { UpdateClinicRequest } from '../models/UpdateClinicRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClinicsService {
    /**
     * List of organization clinics
     * Requires administrator privileges.
     * Returns only active clinics by default.
     * When includeDeactivated=true, deactivated clinics are also returned.
     *
     * @param organizationId
     * @param includeDeactivated Whether to include deactivated entities in the result.
     * Default is false — only active entities are returned.
     *
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ClinicListResponse List of clinics
     * @throws ApiError
     */
    public static listOrganizationClinics(
        organizationId: string,
        includeDeactivated: boolean = false,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ClinicListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/clinics',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'includeDeactivated': includeDeactivated,
                'q': q,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create clinic in organization
     * Requires administrator privileges.
     * A clinic is always created within a specific organization.
     *
     * @param organizationId
     * @param requestBody
     * @returns Clinic Resource created
     * @throws ApiError
     */
    public static createClinic(
        organizationId: string,
        requestBody: CreateClinicRequest,
    ): CancelablePromise<Clinic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{organizationId}/clinics',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get clinic by ID
     * Requires administrator privileges.
     * Deactivated clinics are considered deleted and return 404.
     *
     * @param clinicId
     * @returns Clinic Clinic
     * @throws ApiError
     */
    public static getClinicById(
        clinicId: string,
    ): CancelablePromise<Clinic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clinics/{clinicId}',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update clinic
     * Requires administrator privileges.
     * Changing organizationId is forbidden: a clinic cannot be a parent of a clinic,
     * and cannot be an organization for itself.
     *
     * @param clinicId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateClinic(
        clinicId: string,
        requestBody: UpdateClinicRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/clinics/{clinicId}',
            path: {
                'clinicId': clinicId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete clinic
     * Requires administrator privileges.
     * Deletion is allowed only if the clinic has no departments and associated employees.
     *
     * @param clinicId
     * @returns void
     * @throws ApiError
     */
    public static deleteClinic(
        clinicId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/clinics/{clinicId}',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deactivate clinic
     * Requires administrator privileges.
     * After clinic deactivation, new events cannot be created in this clinic and its departments.
     * Historical data is preserved: employees, events, assignments, and links are not deleted.
     *
     * @param clinicId
     * @returns void
     * @throws ApiError
     */
    public static deactivateClinic(
        clinicId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clinics/{clinicId}/deactivate',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Reactivate clinic
     * Requires administrator privileges.
     * Returns the clinic to an active state.
     *
     * @param clinicId
     * @returns void
     * @throws ApiError
     */
    public static reactivateClinic(
        clinicId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clinics/{clinicId}/reactivate',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get clinic responsibles
     * Requires administrator privileges.
     * Returns responsibles assigned directly to the clinic,
     * as well as organization responsibles (inherited from parent organization).
     * Inherited responsibles from organization cannot be removed at the clinic level.
     * Clinic responsibles are inherited by all departments within it.
     *
     * @param clinicId
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleListResponse List of responsibles
     * @throws ApiError
     */
    public static listClinicResponsibles(
        clinicId: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clinics/{clinicId}/responsibles',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Add clinic responsible
     * Requires administrator privileges.
     * The user must belong to this clinic
     * (be an employee of at least one department of the clinic).
     *
     * @param clinicId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static addClinicResponsible(
        clinicId: string,
        requestBody: AddResponsibleRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clinics/{clinicId}/responsibles',
            path: {
                'clinicId': clinicId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get clinic responsible candidates
     * Requires administrator privileges.
     * Returns only eligible candidates by default.
     * When includeIneligible=true, ineligible candidates are also returned with reasons.
     * Deactivated users are not returned.
     *
     * @param clinicId
     * @param q Search string to filter results.
     * @param includeIneligible Whether to show ineligible candidates as well.
     * Does not affect deactivated users: they are not returned.
     *
     * @param ineligibilityReasonCodes Filter for ineligibility reasons of candidates.
     * Applied when includeIneligible=true.
     * If the user is not an employee, only the cause `not_an_employee` is returned.
     * For employees, reasons `different_organization`, `different_clinic`, `different_department` are used.
     *
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleCandidateListResponse List of clinic responsible candidates
     * @throws ApiError
     */
    public static listClinicResponsibleCandidates(
        clinicId: string,
        q?: string,
        includeIneligible: boolean = false,
        ineligibilityReasonCodes?: Array<IneligibilityReasonCode>,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleCandidateListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clinics/{clinicId}/responsible-candidates',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'q': q,
                'includeIneligible': includeIneligible,
                'ineligibilityReasonCodes': ineligibilityReasonCodes,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get list of clinic employees
     * Requires administrator privileges.
     * Supports search by `q` and cursor pagination.
     *
     * @param clinicId
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ClinicEmployeeListResponse List of clinic employees
     * @throws ApiError
     */
    public static listClinicEmployees(
        clinicId: string,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ClinicEmployeeListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clinics/{clinicId}/employees',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'q': q,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Remove clinic responsible
     * Requires administrator privileges.
     * Removes a responsible assigned directly to the clinic.
     * Inherited responsibles from the organization are removed at the organization level.
     *
     * @param clinicId
     * @param responsibleUserId
     * @returns void
     * @throws ApiError
     */
    public static removeClinicResponsible(
        clinicId: string,
        responsibleUserId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/clinics/{clinicId}/responsibles/{responsibleUserId}',
            path: {
                'clinicId': clinicId,
                'responsibleUserId': responsibleUserId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
