/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
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
export class IncidentClassifierQueryService {
    /**
     * @param categoryId
     * @param limit
     * @param offset
     * @returns v1ListTypesByCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListTypesByCategory(
        categoryId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListTypesByCategoryResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryGetCategory(
        id: string,
    ): CancelablePromise<v1GetCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param rootCategoryId
     * @returns v1ListCategorySubtreeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListCategorySubtree(
        rootCategoryId: string,
    ): CancelablePromise<v1ListCategorySubtreeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-categories/{rootCategoryId}:subtree',
            path: {
                'rootCategoryId': rootCategoryId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryGetType(
        id: string,
    ): CancelablePromise<v1GetTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-types/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListCategoriesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListCategoriesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListCategoriesByOrganizationResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListPatientVisibleCategoriesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListPatientVisibleCategoriesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListPatientVisibleCategoriesByOrganizationResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListActiveRootCategoriesResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListActiveRootCategories(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListActiveRootCategoriesResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListActiveTypesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListActiveTypesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListActiveTypesByOrganizationResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
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
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListPatientAllowedTypesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListPatientAllowedTypesByOrganizationResponse | v1ErrorResponse> {
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
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
