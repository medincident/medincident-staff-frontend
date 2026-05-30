/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgStructureCommandServiceActivateClinicBody } from '../models/OrgStructureCommandServiceActivateClinicBody';
import type { OrgStructureCommandServiceActivateDepartmentBody } from '../models/OrgStructureCommandServiceActivateDepartmentBody';
import type { OrgStructureCommandServiceActivateOrganizationBody } from '../models/OrgStructureCommandServiceActivateOrganizationBody';
import type { OrgStructureCommandServiceCreateClinicBody } from '../models/OrgStructureCommandServiceCreateClinicBody';
import type { OrgStructureCommandServiceCreateDepartmentBody } from '../models/OrgStructureCommandServiceCreateDepartmentBody';
import type { OrgStructureCommandServiceDeactivateClinicBody } from '../models/OrgStructureCommandServiceDeactivateClinicBody';
import type { OrgStructureCommandServiceDeactivateDepartmentBody } from '../models/OrgStructureCommandServiceDeactivateDepartmentBody';
import type { OrgStructureCommandServiceDeactivateOrganizationBody } from '../models/OrgStructureCommandServiceDeactivateOrganizationBody';
import type { OrgStructureCommandServiceUpdateClinicDetailsBody } from '../models/OrgStructureCommandServiceUpdateClinicDetailsBody';
import type { OrgStructureCommandServiceUpdateClinicPhysicalAddressBody } from '../models/OrgStructureCommandServiceUpdateClinicPhysicalAddressBody';
import type { OrgStructureCommandServiceUpdateDepartmentDetailsBody } from '../models/OrgStructureCommandServiceUpdateDepartmentDetailsBody';
import type { OrgStructureCommandServiceUpdateOrganizationDetailsBody } from '../models/OrgStructureCommandServiceUpdateOrganizationDetailsBody';
import type { OrgStructureCommandServiceUpdateOrganizationLegalAddressBody } from '../models/OrgStructureCommandServiceUpdateOrganizationLegalAddressBody';
import type { v1ActivateClinicResponse } from '../models/v1ActivateClinicResponse';
import type { v1ActivateDepartmentResponse } from '../models/v1ActivateDepartmentResponse';
import type { v1ActivateOrganizationResponse } from '../models/v1ActivateOrganizationResponse';
import type { v1CreateClinicResponse } from '../models/v1CreateClinicResponse';
import type { v1CreateDepartmentResponse } from '../models/v1CreateDepartmentResponse';
import type { v1CreateOrganizationRequest } from '../models/v1CreateOrganizationRequest';
import type { v1CreateOrganizationResponse } from '../models/v1CreateOrganizationResponse';
import type { v1DeactivateClinicResponse } from '../models/v1DeactivateClinicResponse';
import type { v1DeactivateDepartmentResponse } from '../models/v1DeactivateDepartmentResponse';
import type { v1DeactivateOrganizationResponse } from '../models/v1DeactivateOrganizationResponse';
import type { v1DeleteClinicResponse } from '../models/v1DeleteClinicResponse';
import type { v1DeleteDepartmentResponse } from '../models/v1DeleteDepartmentResponse';
import type { v1DeleteOrganizationResponse } from '../models/v1DeleteOrganizationResponse';
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
     * @returns v1DeleteClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandDeleteClinic(
        clinicId: string,
    ): CancelablePromise<v1DeleteClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/clinics/{clinicId}',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_not_found\` — clinic with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`clinic_delete_has_dependents\` — clinic has associated incidents or service requests.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param body
     * @returns v1ActivateClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandActivateClinic(
        clinicId: string,
        body: OrgStructureCommandServiceActivateClinicBody,
    ): CancelablePromise<v1ActivateClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/activate',
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
                422: `Business rule violation. Error codes:
                - \`clinic_activate_parent_inactive\` — parent organization is inactive.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param body
     * @returns v1DeactivateClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandDeactivateClinic(
        clinicId: string,
        body: OrgStructureCommandServiceDeactivateClinicBody,
    ): CancelablePromise<v1DeactivateClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/deactivate',
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
     * @returns v1DeleteDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandDeleteDepartment(
        departmentId: string,
    ): CancelablePromise<v1DeleteDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/departments/{departmentId}',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_not_found\` — department with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`department_delete_has_dependents\` — department has associated incidents or service requests.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param body
     * @returns v1ActivateDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandActivateDepartment(
        departmentId: string,
        body: OrgStructureCommandServiceActivateDepartmentBody,
    ): CancelablePromise<v1ActivateDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/departments/{departmentId}/activate',
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
                422: `Business rule violation. Error codes:
                - \`department_activate_parent_inactive\` — parent clinic is inactive.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param body
     * @returns v1DeactivateDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandDeactivateDepartment(
        departmentId: string,
        body: OrgStructureCommandServiceDeactivateDepartmentBody,
    ): CancelablePromise<v1DeactivateDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/departments/{departmentId}/deactivate',
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
                500: `Internal server error. Error codes:
                - \`organization_id_generation_failed\` — failed to generate a new organization ID.
                - \`organization_save_failed\` — database write failed.`,
            },
        });
    }
    /**
     * @param organizationId
     * @returns v1DeleteOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandDeleteOrganization(
        organizationId: string,
    ): CancelablePromise<v1DeleteOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`organization_delete_has_dependents\` — organization has associated incidents or service requests.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param body
     * @returns v1ActivateOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandActivateOrganization(
        organizationId: string,
        body: OrgStructureCommandServiceActivateOrganizationBody,
    ): CancelablePromise<v1ActivateOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/activate',
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
     * @returns v1DeactivateOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandDeactivateOrganization(
        organizationId: string,
        body: OrgStructureCommandServiceDeactivateOrganizationBody,
    ): CancelablePromise<v1DeactivateOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/deactivate',
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
