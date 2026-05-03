/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetCategoryResponse } from '../models/v1GetCategoryResponse';
import type { v1GetTypeResponse } from '../models/v1GetTypeResponse';
import type { v1ListActiveRootCategoriesResponse } from '../models/v1ListActiveRootCategoriesResponse';
import type { v1ListActiveTypesByOrganizationResponse } from '../models/v1ListActiveTypesByOrganizationResponse';
import type { v1ListCategoriesByOrganizationResponse } from '../models/v1ListCategoriesByOrganizationResponse';
import type { v1ListCategorySubtreeResponse } from '../models/v1ListCategorySubtreeResponse';
import type { v1ListPatientAllowedTypesByOrganizationResponse } from '../models/v1ListPatientAllowedTypesByOrganizationResponse';
import type { v1ListPatientVisibleCategoriesByOrganizationResponse } from '../models/v1ListPatientVisibleCategoriesByOrganizationResponse';
import type { v1ListTypesByCategoryResponse } from '../models/v1ListTypesByCategoryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentClassifierQueryServiceService {
    /**
     * @param categoryId
     * @param limit
     * @param offset
     * @returns v1ListTypesByCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListTypesByCategory(
        categoryId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListTypesByCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-categories/{categoryId}/types',
            path: {
                'categoryId': categoryId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetCategoryResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceGetCategory(
        id: string,
    ): CancelablePromise<v1GetCategoryResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-categories/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param rootCategoryId
     * @returns v1ListCategorySubtreeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListCategorySubtree(
        rootCategoryId: string,
    ): CancelablePromise<v1ListCategorySubtreeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-categories/{rootCategoryId}:subtree',
            path: {
                'rootCategoryId': rootCategoryId,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetTypeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceGetType(
        id: string,
    ): CancelablePromise<v1GetTypeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-types/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListCategoriesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListCategoriesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListCategoriesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-categories',
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
     * @returns v1ListPatientVisibleCategoriesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListPatientVisibleCategoriesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListPatientVisibleCategoriesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-categories:patient-visible',
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
     * @returns v1ListActiveRootCategoriesResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListActiveRootCategories(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListActiveRootCategoriesResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-categories:roots',
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
     * @returns v1ListActiveTypesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListActiveTypesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListActiveTypesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-types:active',
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
     * Patient-facing reads. These are scoped to one organisation and return
     * only the slice of the classifier that a patient may see when filing
     * an incident.
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListPatientAllowedTypesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryServiceListPatientAllowedTypesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListPatientAllowedTypesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-types:patient-allowed',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
}
