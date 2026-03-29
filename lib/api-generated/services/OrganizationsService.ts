/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddResponsibleRequest } from '../models/AddResponsibleRequest';
import type { CategoryCandidateIneligibilityReasonCode } from '../models/CategoryCandidateIneligibilityReasonCode';
import type { CategoryResponsibleListResponse } from '../models/CategoryResponsibleListResponse';
import type { CreateOrganizationRequest } from '../models/CreateOrganizationRequest';
import type { EnableOrganizationCategoryRequest } from '../models/EnableOrganizationCategoryRequest';
import type { IneligibilityReasonCode } from '../models/IneligibilityReasonCode';
import type { Organization } from '../models/Organization';
import type { OrganizationCategoryCandidateListResponse } from '../models/OrganizationCategoryCandidateListResponse';
import type { OrganizationCategoryListResponse } from '../models/OrganizationCategoryListResponse';
import type { OrganizationEmployeeListResponse } from '../models/OrganizationEmployeeListResponse';
import type { OrganizationListResponse } from '../models/OrganizationListResponse';
import type { ResponsibleCandidateListResponse } from '../models/ResponsibleCandidateListResponse';
import type { ResponsibleListResponse } from '../models/ResponsibleListResponse';
import type { UpdateOrganizationRequest } from '../models/UpdateOrganizationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationsService {
    /**
     * List of organizations
     * Requires administrator privileges.
     * Returns only active organizations by default.
     * When includeDeactivated=true, deactivated organizations are also returned.
     *
     * @param includeDeactivated Whether to include deactivated entities in the result.
     * Default is false — only active entities are returned.
     *
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns OrganizationListResponse List of organizations
     * @throws ApiError
     */
    public static listOrganizations(
        includeDeactivated: boolean = false,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<OrganizationListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations',
            query: {
                'includeDeactivated': includeDeactivated,
                'q': q,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create organization
     * Requires administrator privileges.
     * @param requestBody
     * @returns Organization Resource created
     * @throws ApiError
     */
    public static createOrganization(
        requestBody: CreateOrganizationRequest,
    ): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get organization by ID
     * Requires administrator privileges.
     * Deactivated organizations are considered deleted and return 404.
     *
     * @param organizationId
     * @returns Organization Organization
     * @throws ApiError
     */
    public static getOrganizationById(
        organizationId: string,
    ): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update organization
     * Requires administrator privileges.
     * @param organizationId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateOrganization(
        organizationId: string,
        requestBody: UpdateOrganizationRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete organization
     * Requires administrator privileges.
     * Deletion is allowed only if the organization has no clinics and associated employees.
     *
     * @param organizationId
     * @returns void
     * @throws ApiError
     */
    public static deleteOrganization(
        organizationId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/organizations/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deactivate organization
     * Requires administrator privileges.
     * After organization deactivation, new events cannot be created in associated clinics and departments.
     * Historical data is preserved: employees, events, assignments, and links are not deleted.
     *
     * @param organizationId
     * @returns void
     * @throws ApiError
     */
    public static deactivateOrganization(
        organizationId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{organizationId}/deactivate',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Reactivate organization
     * Requires administrator privileges.
     * Returns the organization to an active state.
     *
     * @param organizationId
     * @returns void
     * @throws ApiError
     */
    public static reactivateOrganization(
        organizationId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{organizationId}/reactivate',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get organization responsibles
     * Requires administrator privileges.
     * Returns responsibles assigned directly to the organization.
     * Organization responsibles are inherited by all clinics and departments within it.
     *
     * @param organizationId
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleListResponse List of responsibles
     * @throws ApiError
     */
    public static listOrganizationResponsibles(
        organizationId: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/responsibles',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Add organization responsible
     * Requires administrator privileges.
     * The user must belong to this organization
     * (be an employee of at least one department of any clinic in the organization).
     *
     * @param organizationId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static addOrganizationResponsible(
        organizationId: string,
        requestBody: AddResponsibleRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{organizationId}/responsibles',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get organization responsible candidates
     * Requires administrator privileges.
     * Returns only eligible candidates by default.
     * When includeIneligible=true, ineligible candidates are also returned with reasons.
     * Deactivated users are not returned.
     *
     * @param organizationId
     * @param q Search string to filter results.
     * @param includeIneligible Whether to show ineligible candidates as well.
     * Does not affect deactivated users: they are not returned.
     *
     * @param ineligibilityReasonCodes Filter for ineligibility reasons of candidates.
     * Applied when includeIneligible=true.
     * If the user is not an employee, only the cause `not_an_employee` is returned.
     * For employees, reasons `different_organization`, `different_clinic`, `different_department` are used.
     *
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleCandidateListResponse List of organization responsible candidates
     * @throws ApiError
     */
    public static listOrganizationResponsibleCandidates(
        organizationId: string,
        q?: string,
        includeIneligible: boolean = false,
        ineligibilityReasonCodes?: Array<IneligibilityReasonCode>,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleCandidateListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/responsible-candidates',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'q': q,
                'includeIneligible': includeIneligible,
                'ineligibilityReasonCodes': ineligibilityReasonCodes,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get organization employees
     * Requires administrator privileges.
     * Supports search by `q` and cursor pagination.
     *
     * @param organizationId
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns OrganizationEmployeeListResponse List of organization employees
     * @throws ApiError
     */
    public static listOrganizationEmployees(
        organizationId: string,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<OrganizationEmployeeListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/employees',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'q': q,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Remove organization responsible
     * Requires administrator privileges.
     * Removes a responsible assigned directly to the organization.
     *
     * @param organizationId
     * @param responsibleUserId
     * @returns void
     * @throws ApiError
     */
    public static removeOrganizationResponsible(
        organizationId: string,
        responsibleUserId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/organizations/{organizationId}/responsibles/{responsibleUserId}',
            path: {
                'organizationId': organizationId,
                'responsibleUserId': responsibleUserId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List of categories allowed for organization
     * Requires administrator privileges.
     * Returns all categories allowed for this organization — explicitly and via inheritance.
     * Categories are returned in a flat list in depth-first traversal order:
     * first the root category, then all its children, then the next root one.
     * For child categories, category.parentId is filled so the UI can reconstruct the tree.
     *
     * @param organizationId
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns OrganizationCategoryListResponse List of allowed organization categories
     * @throws ApiError
     */
    public static listOrganizationCategories(
        organizationId: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<OrganizationCategoryListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/categories',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Enable category for organization
     * Requires administrator privileges.
     * Explicitly enables a category for this organization.
     * All child categories of the enabled category automatically
     * become available via inheritance (isDirectlyEnabled=false).
     *
     * @param organizationId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static enableOrganizationCategory(
        organizationId: string,
        requestBody: EnableOrganizationCategoryRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{organizationId}/categories',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Resource state conflict`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Find category candidates for organization
     * Requires administrator privileges.
     * Returns candidates for enabling a category in the organization.
     * By default, only eligible candidates are returned (eligible=true).
     * When includeIneligible=true, ineligible candidates are also returned with reasons.
     * Categories are returned in a flat list in depth-first traversal order.
     * For child categories, category.parentId is filled so the UI can reconstruct the tree.
     *
     * @param organizationId
     * @param q Search string to filter results.
     * @param includeIneligible Whether to show ineligible candidates as well.
     * Does not affect deactivated users: they are not returned.
     *
     * @param ineligibilityReasonCodes Filter for category candidate ineligibility reasons.
     * Applied when includeIneligible=true.
     * This parameter is ignored when includeIneligible=false.
     *
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns OrganizationCategoryCandidateListResponse List of category candidates for organization
     * @throws ApiError
     */
    public static listOrganizationCategoryCandidates(
        organizationId: string,
        q?: string,
        includeIneligible: boolean = false,
        ineligibilityReasonCodes?: Array<CategoryCandidateIneligibilityReasonCode>,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<OrganizationCategoryCandidateListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/category-candidates',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'q': q,
                'includeIneligible': includeIneligible,
                'ineligibilityReasonCodes': ineligibilityReasonCodes,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Disable category for organization
     * Requires administrator privileges.
     * Removes explicit permission for the category in the organization.
     * Applicable only to categories with isDirectlyEnabled=true.
     * Inherited categories (isDirectlyEnabled=false) cannot be removed directly —
     * explicit permission must be removed from the parent category.
     *
     * @param organizationId
     * @param categoryId
     * @returns void
     * @throws ApiError
     */
    public static disableOrganizationCategory(
        organizationId: string,
        categoryId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/organizations/{organizationId}/categories/{categoryId}',
            path: {
                'organizationId': organizationId,
                'categoryId': categoryId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get organization category responsibles
     * Requires administrator privileges.
     * Returns responsibles for this category within the context of the specific organization.
     * Includes responsibles assigned directly to the category,
     * as well as responsibles inherited from the parent category.
     * The category must be enabled for this organization.
     *
     * @param organizationId
     * @param categoryId
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns CategoryResponsibleListResponse List of responsibles
     * @throws ApiError
     */
    public static listOrganizationCategoryResponsibles(
        organizationId: string,
        categoryId: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<CategoryResponsibleListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/categories/{categoryId}/responsibles',
            path: {
                'organizationId': organizationId,
                'categoryId': categoryId,
            },
            query: {
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Add organization category responsible
     * Requires administrator privileges.
     * Assigns a user as responsible for this category in the organization context.
     * The user must be an employee of this organization.
     * The category must be enabled for this organization.
     *
     * @param organizationId
     * @param categoryId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static addOrganizationCategoryResponsible(
        organizationId: string,
        categoryId: string,
        requestBody: AddResponsibleRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{organizationId}/categories/{categoryId}/responsibles',
            path: {
                'organizationId': organizationId,
                'categoryId': categoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Remove organization category responsible
     * Requires administrator privileges.
     * Removes a responsible assigned directly to this category.
     * Impossible to remove an inherited responsible — must be removed from the parent category.
     *
     * @param organizationId
     * @param categoryId
     * @param responsibleUserId
     * @returns void
     * @throws ApiError
     */
    public static removeOrganizationCategoryResponsible(
        organizationId: string,
        categoryId: string,
        responsibleUserId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/organizations/{organizationId}/categories/{categoryId}/responsibles/{responsibleUserId}',
            path: {
                'organizationId': organizationId,
                'categoryId': categoryId,
                'responsibleUserId': responsibleUserId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get organization category responsible candidates
     * Requires administrator privileges.
     * Returns only eligible candidates by default — employees of this organization.
     * When includeIneligible=true, ineligible candidates are also returned with reasons.
     * Deactivated users are not returned.
     *
     * @param organizationId
     * @param categoryId
     * @param q Search string to filter results.
     * @param includeIneligible Whether to show ineligible candidates as well.
     * Does not affect deactivated users: they are not returned.
     *
     * @param ineligibilityReasonCodes Filter for ineligibility reasons of candidates.
     * Applied when includeIneligible=true.
     * If the user is not an employee, only the cause `not_an_employee` is returned.
     * For employees, reasons `different_organization`, `different_clinic`, `different_department` are used.
     *
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleCandidateListResponse List of candidates
     * @throws ApiError
     */
    public static listOrganizationCategoryResponsibleCandidates(
        organizationId: string,
        categoryId: string,
        q?: string,
        includeIneligible: boolean = false,
        ineligibilityReasonCodes?: Array<IneligibilityReasonCode>,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleCandidateListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{organizationId}/categories/{categoryId}/responsible-candidates',
            path: {
                'organizationId': organizationId,
                'categoryId': categoryId,
            },
            query: {
                'q': q,
                'includeIneligible': includeIneligible,
                'ineligibilityReasonCodes': ineligibilityReasonCodes,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
