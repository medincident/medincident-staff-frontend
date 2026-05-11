/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ServiceRequestCommandServiceAssignExecutorsBody } from '../models/ServiceRequestCommandServiceAssignExecutorsBody';
import type { ServiceRequestCommandServiceUpdateServiceRequestDescriptionBody } from '../models/ServiceRequestCommandServiceUpdateServiceRequestDescriptionBody';
import type { ServiceRequestCommandServiceUpdateServiceRequestStatusBody } from '../models/ServiceRequestCommandServiceUpdateServiceRequestStatusBody';
import type { v1AssignExecutorsResponse } from '../models/v1AssignExecutorsResponse';
import type { v1CreateServiceRequestRequest } from '../models/v1CreateServiceRequestRequest';
import type { v1CreateServiceRequestResponse } from '../models/v1CreateServiceRequestResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1UpdateServiceRequestDescriptionResponse } from '../models/v1UpdateServiceRequestDescriptionResponse';
import type { v1UpdateServiceRequestStatusResponse } from '../models/v1UpdateServiceRequestStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceRequestCommandService {
    /**
     * @param body
     * @returns v1CreateServiceRequestResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandCreateServiceRequest(
        body: v1CreateServiceRequestRequest,
    ): CancelablePromise<v1CreateServiceRequestResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/service-requests',
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_department_not_found\` — department with the given ID does not exist.
                - \`service_request_clinic_not_found\` — clinic linked to the department does not exist.
                - \`service_request_type_not_found\` — request type with the given ID does not exist.
                - \`service_request_incident_not_found\` — linked incident with the given ID does not exist.
                - \`service_request_employee_not_found\` — one of the executor employees was not found.`,
                422: `Failed precondition. Error codes:
                - \`service_request_type_inactive\` — the request type is inactive.
                - \`service_request_type_org_mismatch\` — the request type belongs to a different organization.
                - \`service_request_incident_org_mismatch\` — the linked incident belongs to a different organization.
                - \`service_request_employee_dept_mismatch\` — an executor employee does not belong to the specified department.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param serviceRequestId
     * @param body
     * @returns v1UpdateServiceRequestDescriptionResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandUpdateServiceRequestDescription(
        serviceRequestId: string,
        body: ServiceRequestCommandServiceUpdateServiceRequestDescriptionBody,
    ): CancelablePromise<v1UpdateServiceRequestDescriptionResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/service-requests/{serviceRequestId}/description',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_not_found\` — service request with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`service_request_frozen\` — service request is frozen and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param serviceRequestId
     * @param body
     * @returns v1AssignExecutorsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandAssignExecutors(
        serviceRequestId: string,
        body: ServiceRequestCommandServiceAssignExecutorsBody,
    ): CancelablePromise<v1AssignExecutorsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/service-requests/{serviceRequestId}/executors',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_not_found\` — service request with the given ID does not exist.
                - \`service_request_employee_not_found\` — one of the executor employees was not found.`,
                422: `Failed precondition. Error codes:
                - \`service_request_frozen\` — service request is frozen and cannot be modified.
                - \`service_request_employee_dept_mismatch\` — an executor employee does not belong to the service request's department.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param serviceRequestId
     * @param body
     * @returns v1UpdateServiceRequestStatusResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandUpdateServiceRequestStatus(
        serviceRequestId: string,
        body: ServiceRequestCommandServiceUpdateServiceRequestStatusBody,
    ): CancelablePromise<v1UpdateServiceRequestStatusResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/service-requests/{serviceRequestId}/status',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`service_request_not_found\` — service request with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`service_request_invalid_status_transition\` — the requested status transition is not allowed.
                - \`service_request_frozen\` — service request is frozen and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
