/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RequestClassifierCommandServiceCreateRequestTypeBody } from '../models/RequestClassifierCommandServiceCreateRequestTypeBody';
import type { RequestClassifierCommandServiceUpdateRequestTypeDetailsBody } from '../models/RequestClassifierCommandServiceUpdateRequestTypeDetailsBody';
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CreateRequestTypeResponse } from '../models/v1CreateRequestTypeResponse';
import type { v1DeactivateRequestTypeResponse } from '../models/v1DeactivateRequestTypeResponse';
import type { v1DeleteRequestTypeResponse } from '../models/v1DeleteRequestTypeResponse';
import type { v1ReactivateRequestTypeResponse } from '../models/v1ReactivateRequestTypeResponse';
import type { v1UpdateRequestTypeDetailsResponse } from '../models/v1UpdateRequestTypeDetailsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RequestClassifierCommandServiceService {
    /**
     * @param organizationId
     * @param body
     * @returns v1CreateRequestTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandServiceCreateRequestType(
        organizationId: string,
        body: RequestClassifierCommandServiceCreateRequestTypeBody,
    ): CancelablePromise<v1CreateRequestTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/request-types',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
    /**
     * @param typeId
     * @returns v1DeleteRequestTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandServiceDeleteRequestType(
        typeId: string,
    ): CancelablePromise<v1DeleteRequestTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/request-types/{typeId}',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DeactivateRequestTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandServiceDeactivateRequestType(
        typeId: string,
    ): CancelablePromise<v1DeactivateRequestTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/request-types/{typeId}/deactivations',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @param body
     * @returns v1UpdateRequestTypeDetailsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandServiceUpdateRequestTypeDetails(
        typeId: string,
        body: RequestClassifierCommandServiceUpdateRequestTypeDetailsBody,
    ): CancelablePromise<v1UpdateRequestTypeDetailsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/request-types/{typeId}/details',
            path: {
                'typeId': typeId,
            },
            body: body,
        });
    }
    /**
     * @param typeId
     * @returns v1ReactivateRequestTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static requestClassifierCommandServiceReactivateRequestType(
        typeId: string,
    ): CancelablePromise<v1ReactivateRequestTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/request-types/{typeId}/reactivations',
            path: {
                'typeId': typeId,
            },
        });
    }
}
