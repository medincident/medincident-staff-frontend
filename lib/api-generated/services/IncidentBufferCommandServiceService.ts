/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncidentBufferCommandServicePublishPatientIncidentBody } from '../models/IncidentBufferCommandServicePublishPatientIncidentBody';
import type { IncidentBufferCommandServiceUpdatePatientIncidentBody } from '../models/IncidentBufferCommandServiceUpdatePatientIncidentBody';
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CancelPatientIncidentResponse } from '../models/v1CancelPatientIncidentResponse';
import type { v1PublishPatientIncidentResponse } from '../models/v1PublishPatientIncidentResponse';
import type { v1RejectPatientIncidentResponse } from '../models/v1RejectPatientIncidentResponse';
import type { v1SubmitPatientIncidentRequest } from '../models/v1SubmitPatientIncidentRequest';
import type { v1SubmitPatientIncidentResponse } from '../models/v1SubmitPatientIncidentResponse';
import type { v1UpdatePatientIncidentResponse } from '../models/v1UpdatePatientIncidentResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentBufferCommandServiceService {
    /**
     * @param body
     * @returns v1SubmitPatientIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandServiceSubmitPatientIncident(
        body: v1SubmitPatientIncidentRequest,
    ): CancelablePromise<v1SubmitPatientIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents',
            body: body,
        });
    }
    /**
     * @param bufferId
     * @param body
     * @returns v1UpdatePatientIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandServiceUpdatePatientIncident(
        bufferId: string,
        body: IncidentBufferCommandServiceUpdatePatientIncidentBody,
    ): CancelablePromise<v1UpdatePatientIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/patient-incidents/{bufferId}',
            path: {
                'bufferId': bufferId,
            },
            body: body,
        });
    }
    /**
     * @param bufferId
     * @returns v1CancelPatientIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandServiceCancelPatientIncident(
        bufferId: string,
    ): CancelablePromise<v1CancelPatientIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents/{bufferId}:cancel',
            path: {
                'bufferId': bufferId,
            },
        });
    }
    /**
     * @param bufferId
     * @param body
     * @returns v1PublishPatientIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandServicePublishPatientIncident(
        bufferId: string,
        body: IncidentBufferCommandServicePublishPatientIncidentBody,
    ): CancelablePromise<v1PublishPatientIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents/{bufferId}:publish',
            path: {
                'bufferId': bufferId,
            },
            body: body,
        });
    }
    /**
     * @param bufferId
     * @returns v1RejectPatientIncidentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentBufferCommandServiceRejectPatientIncident(
        bufferId: string,
    ): CancelablePromise<v1RejectPatientIncidentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/patient-incidents/{bufferId}:reject',
            path: {
                'bufferId': bufferId,
            },
        });
    }
}
