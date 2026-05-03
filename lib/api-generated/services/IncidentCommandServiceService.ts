/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncidentCommandServiceUpdateIncidentDescriptionBody } from '../models/IncidentCommandServiceUpdateIncidentDescriptionBody';
import type { IncidentCommandServiceUpdateIncidentPriorityBody } from '../models/IncidentCommandServiceUpdateIncidentPriorityBody';
import type { IncidentCommandServiceUpdateIncidentStatusBody } from '../models/IncidentCommandServiceUpdateIncidentStatusBody';
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CancelIncidentResponse } from '../models/v1CancelIncidentResponse';
import type { v1CreateIncidentRequest } from '../models/v1CreateIncidentRequest';
import type { v1CreateIncidentResponse } from '../models/v1CreateIncidentResponse';
import type { v1ReopenIncidentResponse } from '../models/v1ReopenIncidentResponse';
import type { v1UpdateIncidentDescriptionResponse } from '../models/v1UpdateIncidentDescriptionResponse';
import type { v1UpdateIncidentPriorityResponse } from '../models/v1UpdateIncidentPriorityResponse';
import type { v1UpdateIncidentStatusResponse } from '../models/v1UpdateIncidentStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentCommandServiceService {
    /**
     * @param body
     * @returns v1CreateIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandServiceCreateIncident(
        body: v1CreateIncidentRequest,
    ): CancelablePromise<v1CreateIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incidents',
            body: body,
        });
    }
    /**
     * @param incidentId
     * @param body
     * @returns v1UpdateIncidentDescriptionResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandServiceUpdateIncidentDescription(
        incidentId: string,
        body: IncidentCommandServiceUpdateIncidentDescriptionBody,
    ): CancelablePromise<v1UpdateIncidentDescriptionResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incidents/{incidentId}/description',
            path: {
                'incidentId': incidentId,
            },
            body: body,
        });
    }
    /**
     * @param incidentId
     * @param body
     * @returns v1UpdateIncidentPriorityResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandServiceUpdateIncidentPriority(
        incidentId: string,
        body: IncidentCommandServiceUpdateIncidentPriorityBody,
    ): CancelablePromise<v1UpdateIncidentPriorityResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incidents/{incidentId}/priority',
            path: {
                'incidentId': incidentId,
            },
            body: body,
        });
    }
    /**
     * @param incidentId
     * @param body
     * @returns v1UpdateIncidentStatusResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandServiceUpdateIncidentStatus(
        incidentId: string,
        body: IncidentCommandServiceUpdateIncidentStatusBody,
    ): CancelablePromise<v1UpdateIncidentStatusResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incidents/{incidentId}/status',
            path: {
                'incidentId': incidentId,
            },
            body: body,
        });
    }
    /**
     * @param incidentId
     * @returns v1CancelIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandServiceCancelIncident(
        incidentId: string,
    ): CancelablePromise<v1CancelIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incidents/{incidentId}:cancel',
            path: {
                'incidentId': incidentId,
            },
        });
    }
    /**
     * @param incidentId
     * @returns v1ReopenIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentCommandServiceReopenIncident(
        incidentId: string,
    ): CancelablePromise<v1ReopenIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incidents/{incidentId}:reopen',
            path: {
                'incidentId': incidentId,
            },
        });
    }
}
