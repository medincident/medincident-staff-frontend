/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetRequestTypeResponse } from '../models/v1GetRequestTypeResponse';
import type { v1ListActiveRequestTypesByOrganizationResponse } from '../models/v1ListActiveRequestTypesByOrganizationResponse';
import type { v1ListRequestTypesByOrganizationResponse } from '../models/v1ListRequestTypesByOrganizationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RequestClassifierQueryService {
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @returns v1ListRequestTypesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierQueryListRequestTypesByOrganization(
        organizationId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListRequestTypesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/request-types',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`request_classifier_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @returns v1ListActiveRequestTypesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierQueryListActiveRequestTypesByOrganization(
        organizationId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListActiveRequestTypesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/request-types:active',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`request_classifier_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetRequestTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierQueryGetRequestType(
        id: string,
    ): CancelablePromise<v1GetRequestTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/request-types/{id}',
            path: {
                'id': id,
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
}
