/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetCategoryResponse } from '../models/v1GetCategoryResponse';
import type { v1GetTypeResponse } from '../models/v1GetTypeResponse';
import type { v1ListCategoriesByOrganizationResponse } from '../models/v1ListCategoriesByOrganizationResponse';
import type { v1ListCategorySubtreeResponse } from '../models/v1ListCategorySubtreeResponse';
import type { v1ListRootCategoriesResponse } from '../models/v1ListRootCategoriesResponse';
import type { v1ListTypesByCategoryResponse } from '../models/v1ListTypesByCategoryResponse';
import type { v1ListTypesByOrganizationResponse } from '../models/v1ListTypesByOrganizationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentClassifierQueryService {
    /**
     * @param categoryId
     * @param limit
     * @param after
     * @param includeDeactivated
     * @returns v1ListTypesByCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListTypesByCategory(
        categoryId: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListTypesByCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/incident-categories/{categoryId}/types',
            path: {
                'categoryId': categoryId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_classifier_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
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
                500: `Internal server error. Error codes:
                - \`incident_category_load_failed\` — database query failed.`,
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
     * @param after
     * @param includeDeactivated
     * @returns v1ListRootCategoriesResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListRootCategories(
        organizationId: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListRootCategoriesResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-categories',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_classifier_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @param includeDeactivated
     * @returns v1ListCategoriesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListCategoriesByOrganization(
        organizationId: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListCategoriesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-categories:all',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_classifier_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @param includeDeactivated
     * @returns v1ListTypesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierQueryListTypesByOrganization(
        organizationId: string,
        limit?: number,
        after?: string,
        includeDeactivated?: boolean,
    ): CancelablePromise<v1ListTypesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/incident-types',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeDeactivated': includeDeactivated,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`incident_classifier_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied. Error codes:
                - \`permission_denied\` — include_deactivated=true requires org-admin or system-admin privileges.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
