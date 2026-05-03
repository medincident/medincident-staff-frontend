/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncidentClassifierCommandServiceCreateIncidentCategoryBody } from '../models/IncidentClassifierCommandServiceCreateIncidentCategoryBody';
import type { IncidentClassifierCommandServiceCreateIncidentTypeBody } from '../models/IncidentClassifierCommandServiceCreateIncidentTypeBody';
import type { IncidentClassifierCommandServiceMoveIncidentCategoryBody } from '../models/IncidentClassifierCommandServiceMoveIncidentCategoryBody';
import type { IncidentClassifierCommandServiceMoveIncidentTypeBody } from '../models/IncidentClassifierCommandServiceMoveIncidentTypeBody';
import type { IncidentClassifierCommandServiceUpdateIncidentCategoryDetailsBody } from '../models/IncidentClassifierCommandServiceUpdateIncidentCategoryDetailsBody';
import type { IncidentClassifierCommandServiceUpdateIncidentTypeDetailsBody } from '../models/IncidentClassifierCommandServiceUpdateIncidentTypeDetailsBody';
import type { rpcStatus } from '../models/rpcStatus';
import type { v1AllowIncidentTypeForPatientsResponse } from '../models/v1AllowIncidentTypeForPatientsResponse';
import type { v1CreateIncidentCategoryResponse } from '../models/v1CreateIncidentCategoryResponse';
import type { v1CreateIncidentTypeResponse } from '../models/v1CreateIncidentTypeResponse';
import type { v1DeactivateIncidentCategoryResponse } from '../models/v1DeactivateIncidentCategoryResponse';
import type { v1DeactivateIncidentTypeResponse } from '../models/v1DeactivateIncidentTypeResponse';
import type { v1DeleteIncidentCategoryResponse } from '../models/v1DeleteIncidentCategoryResponse';
import type { v1DeleteIncidentTypeResponse } from '../models/v1DeleteIncidentTypeResponse';
import type { v1DisallowIncidentTypeForPatientsResponse } from '../models/v1DisallowIncidentTypeForPatientsResponse';
import type { v1MoveIncidentCategoryResponse } from '../models/v1MoveIncidentCategoryResponse';
import type { v1MoveIncidentTypeResponse } from '../models/v1MoveIncidentTypeResponse';
import type { v1ReactivateIncidentCategoryResponse } from '../models/v1ReactivateIncidentCategoryResponse';
import type { v1ReactivateIncidentTypeResponse } from '../models/v1ReactivateIncidentTypeResponse';
import type { v1UpdateIncidentCategoryDetailsResponse } from '../models/v1UpdateIncidentCategoryDetailsResponse';
import type { v1UpdateIncidentTypeDetailsResponse } from '../models/v1UpdateIncidentTypeDetailsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentClassifierCommandServiceService {
    /**
     * @param categoryId
     * @returns v1DeleteIncidentCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceDeleteIncidentCategory(
        categoryId: string,
    ): CancelablePromise<v1DeleteIncidentCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/incident-categories/{categoryId}',
            path: {
                'categoryId': categoryId,
            },
        });
    }
    /**
     * @param categoryId
     * @returns v1DeactivateIncidentCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceDeactivateIncidentCategory(
        categoryId: string,
    ): CancelablePromise<v1DeactivateIncidentCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}/deactivations',
            path: {
                'categoryId': categoryId,
            },
        });
    }
    /**
     * @param categoryId
     * @param body
     * @returns v1UpdateIncidentCategoryDetailsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceUpdateIncidentCategoryDetails(
        categoryId: string,
        body: IncidentClassifierCommandServiceUpdateIncidentCategoryDetailsBody,
    ): CancelablePromise<v1UpdateIncidentCategoryDetailsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incident-categories/{categoryId}/details',
            path: {
                'categoryId': categoryId,
            },
            body: body,
        });
    }
    /**
     * @param categoryId
     * @returns v1ReactivateIncidentCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceReactivateIncidentCategory(
        categoryId: string,
    ): CancelablePromise<v1ReactivateIncidentCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}/reactivations',
            path: {
                'categoryId': categoryId,
            },
        });
    }
    /**
     * --- Types ---
     * @param categoryId
     * @param body
     * @returns v1CreateIncidentTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceCreateIncidentType(
        categoryId: string,
        body: IncidentClassifierCommandServiceCreateIncidentTypeBody,
    ): CancelablePromise<v1CreateIncidentTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}/types',
            path: {
                'categoryId': categoryId,
            },
            body: body,
        });
    }
    /**
     * @param categoryId
     * @param body
     * @returns v1MoveIncidentCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceMoveIncidentCategory(
        categoryId: string,
        body: IncidentClassifierCommandServiceMoveIncidentCategoryBody,
    ): CancelablePromise<v1MoveIncidentCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}:move',
            path: {
                'categoryId': categoryId,
            },
            body: body,
        });
    }
    /**
     * @param typeId
     * @returns v1DeleteIncidentTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceDeleteIncidentType(
        typeId: string,
    ): CancelablePromise<v1DeleteIncidentTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/incident-types/{typeId}',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DeactivateIncidentTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceDeactivateIncidentType(
        typeId: string,
    ): CancelablePromise<v1DeactivateIncidentTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}/deactivations',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @param body
     * @returns v1UpdateIncidentTypeDetailsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceUpdateIncidentTypeDetails(
        typeId: string,
        body: IncidentClassifierCommandServiceUpdateIncidentTypeDetailsBody,
    ): CancelablePromise<v1UpdateIncidentTypeDetailsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incident-types/{typeId}/details',
            path: {
                'typeId': typeId,
            },
            body: body,
        });
    }
    /**
     * @param typeId
     * @returns v1DisallowIncidentTypeForPatientsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceDisallowIncidentTypeForPatients(
        typeId: string,
    ): CancelablePromise<v1DisallowIncidentTypeForPatientsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/incident-types/{typeId}/patient-allowances',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1AllowIncidentTypeForPatientsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceAllowIncidentTypeForPatients(
        typeId: string,
    ): CancelablePromise<v1AllowIncidentTypeForPatientsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}/patient-allowances',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1ReactivateIncidentTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceReactivateIncidentType(
        typeId: string,
    ): CancelablePromise<v1ReactivateIncidentTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}/reactivations',
            path: {
                'typeId': typeId,
            },
        });
    }
    /**
     * @param typeId
     * @param body
     * @returns v1MoveIncidentTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceMoveIncidentType(
        typeId: string,
        body: IncidentClassifierCommandServiceMoveIncidentTypeBody,
    ): CancelablePromise<v1MoveIncidentTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}:move',
            path: {
                'typeId': typeId,
            },
            body: body,
        });
    }
    /**
     * --- Categories ---
     * @param organizationId
     * @param body
     * @returns v1CreateIncidentCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandServiceCreateIncidentCategory(
        organizationId: string,
        body: IncidentClassifierCommandServiceCreateIncidentCategoryBody,
    ): CancelablePromise<v1CreateIncidentCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/incident-categories',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
}
