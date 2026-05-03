/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { ServiceRequestCommandServiceAssignExecutorsBody } from '../models/ServiceRequestCommandServiceAssignExecutorsBody';
import type { ServiceRequestCommandServiceUpdateServiceRequestDescriptionBody } from '../models/ServiceRequestCommandServiceUpdateServiceRequestDescriptionBody';
import type { ServiceRequestCommandServiceUpdateServiceRequestStatusBody } from '../models/ServiceRequestCommandServiceUpdateServiceRequestStatusBody';
import type { v1AssignExecutorsResponse } from '../models/v1AssignExecutorsResponse';
import type { v1CreateServiceRequestRequest } from '../models/v1CreateServiceRequestRequest';
import type { v1CreateServiceRequestResponse } from '../models/v1CreateServiceRequestResponse';
import type { v1UpdateServiceRequestDescriptionResponse } from '../models/v1UpdateServiceRequestDescriptionResponse';
import type { v1UpdateServiceRequestStatusResponse } from '../models/v1UpdateServiceRequestStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceRequestCommandServiceService {
    /**
     * @param body
     * @returns v1CreateServiceRequestResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandServiceCreateServiceRequest(
        body: v1CreateServiceRequestRequest,
    ): CancelablePromise<v1CreateServiceRequestResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/service-requests',
            body: body,
        });
    }
    /**
     * @param serviceRequestId
     * @param body
     * @returns v1UpdateServiceRequestDescriptionResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandServiceUpdateServiceRequestDescription(
        serviceRequestId: string,
        body: ServiceRequestCommandServiceUpdateServiceRequestDescriptionBody,
    ): CancelablePromise<v1UpdateServiceRequestDescriptionResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/service-requests/{serviceRequestId}/description',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            body: body,
        });
    }
    /**
     * @param serviceRequestId
     * @param body
     * @returns v1AssignExecutorsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandServiceAssignExecutors(
        serviceRequestId: string,
        body: ServiceRequestCommandServiceAssignExecutorsBody,
    ): CancelablePromise<v1AssignExecutorsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/service-requests/{serviceRequestId}/executors',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            body: body,
        });
    }
    /**
     * @param serviceRequestId
     * @param body
     * @returns v1UpdateServiceRequestStatusResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static serviceRequestCommandServiceUpdateServiceRequestStatus(
        serviceRequestId: string,
        body: ServiceRequestCommandServiceUpdateServiceRequestStatusBody,
    ): CancelablePromise<v1UpdateServiceRequestStatusResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/service-requests/{serviceRequestId}/status',
            path: {
                'serviceRequestId': serviceRequestId,
            },
            body: body,
        });
    }
}
