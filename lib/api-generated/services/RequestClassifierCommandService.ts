/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RequestClassifierCommandServiceCreateRequestTypeBody } from '../models/RequestClassifierCommandServiceCreateRequestTypeBody';
import type { RequestClassifierCommandServiceUpdateRequestTypeDetailsBody } from '../models/RequestClassifierCommandServiceUpdateRequestTypeDetailsBody';
import type { v1CreateRequestTypeResponse } from '../models/v1CreateRequestTypeResponse';
import type { v1DeactivateRequestTypeResponse } from '../models/v1DeactivateRequestTypeResponse';
import type { v1DeleteRequestTypeResponse } from '../models/v1DeleteRequestTypeResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1ReactivateRequestTypeResponse } from '../models/v1ReactivateRequestTypeResponse';
import type { v1UpdateRequestTypeDetailsResponse } from '../models/v1UpdateRequestTypeDetailsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RequestClassifierCommandService {
    /**
     * @param organizationId
     * @param body
     * @returns v1CreateRequestTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandCreateRequestType(
        organizationId: string,
        body: RequestClassifierCommandServiceCreateRequestTypeBody,
    ): CancelablePromise<v1CreateRequestTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/request-types',
            path: {
                'organizationId': organizationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                409: `Conflict. Error codes:
                - \`request_type_name_conflict\` — a request type with this name already exists in the organization.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DeleteRequestTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandDeleteRequestType(
        typeId: string,
    ): CancelablePromise<v1DeleteRequestTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/request-types/{typeId}',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`request_type_not_found\` — request type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DeactivateRequestTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandDeactivateRequestType(
        typeId: string,
    ): CancelablePromise<v1DeactivateRequestTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/request-types/{typeId}/deactivations',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`request_type_not_found\` — request type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @param body
     * @returns v1UpdateRequestTypeDetailsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandUpdateRequestTypeDetails(
        typeId: string,
        body: RequestClassifierCommandServiceUpdateRequestTypeDetailsBody,
    ): CancelablePromise<v1UpdateRequestTypeDetailsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/request-types/{typeId}/details',
            path: {
                'typeId': typeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`request_type_not_found\` — request type with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`request_type_name_conflict\` — a request type with this name already exists in the organization.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1ReactivateRequestTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandReactivateRequestType(
        typeId: string,
    ): CancelablePromise<v1ReactivateRequestTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/request-types/{typeId}/reactivations',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`request_type_not_found\` — request type with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`request_type_name_conflict\` — reactivation would create a name conflict with an active type.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
