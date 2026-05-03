/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetRequestTypeResponse } from '../models/v1GetRequestTypeResponse';
import type { v1ListActiveRequestTypesByOrganizationResponse } from '../models/v1ListActiveRequestTypesByOrganizationResponse';
import type { v1ListRequestTypesByOrganizationResponse } from '../models/v1ListRequestTypesByOrganizationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RequestClassifierQueryServiceService {
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListRequestTypesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierQueryServiceListRequestTypesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListRequestTypesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/request-types',
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
     * @param limit
     * @param offset
     * @returns v1ListActiveRequestTypesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierQueryServiceListActiveRequestTypesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListActiveRequestTypesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/request-types:active',
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
     * @param id
     * @returns v1GetRequestTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierQueryServiceGetRequestType(
        id: string,
    ): CancelablePromise<v1GetRequestTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/request-types/{id}',
            path: {
                'id': id,
            },
        });
    }
}
