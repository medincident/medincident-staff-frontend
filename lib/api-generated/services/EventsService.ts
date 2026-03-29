/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Category } from '../models/Category';
import type { CategoryListResponse } from '../models/CategoryListResponse';
import type { CreateCategoryRequest } from '../models/CreateCategoryRequest';
import type { CreateEventTypeRequest } from '../models/CreateEventTypeRequest';
import type { EventType } from '../models/EventType';
import type { EventTypeListResponse } from '../models/EventTypeListResponse';
import type { UpdateCategoryRequest } from '../models/UpdateCategoryRequest';
import type { UpdateEventTypeRequest } from '../models/UpdateEventTypeRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EventsService {
    /**
     * List of event categories
     * Requires administrator privileges.
     * Returns only active categories by default.
     * Deactivated categories are considered disabled permanently and excluded from normal navigation.
     * When includeDeactivated=true, deactivated categories are also returned.
     * Categories are returned in a flat list in depth-first traversal order:
     * first the root category, then all its children, then the next root one.
     * For child categories, parentId is filled so the UI can reconstruct the tree.
     *
     * @param includeDeactivated Whether to include deactivated entities in the result.
     * Default is false — only active entities are returned.
     *
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns CategoryListResponse List of categories
     * @throws ApiError
     */
    public static listEventCategories(
        includeDeactivated: boolean = false,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<CategoryListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/events/categories',
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
     * Create new event category
     * Requires administrator privileges.
     * @param requestBody
     * @returns Category Resource created
     * @throws ApiError
     */
    public static createEventCategory(
        requestBody: CreateCategoryRequest,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/events/categories',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                409: `Resource state conflict`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get event category by ID
     * Deactivated categories (including those deactivated recursively by parent) return 404.
     *
     * @param categoryId
     * @returns Category Event category
     * @throws ApiError
     */
    public static getEventCategoryById(
        categoryId: string,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/events/categories/{categoryId}',
            path: {
                'categoryId': categoryId,
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
     * Update event category
     * Requires administrator privileges.
     * Supports changing parentId (moving in the tree).
     * Creating cycles and specifying the category as its own parent is forbidden.
     *
     * @param categoryId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateEventCategory(
        categoryId: string,
        requestBody: UpdateCategoryRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/events/categories/{categoryId}',
            path: {
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
     * Delete event category
     * Requires administrator privileges.
     * Deletes the category and its entire subtree (all child categories recursively).
     * All event types within deleted categories are also deleted.
     *
     * @param categoryId
     * @returns void
     * @throws ApiError
     */
    public static deleteEventCategory(
        categoryId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/events/categories/{categoryId}',
            path: {
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
     * Deactivate event category
     * Requires administrator privileges.
     * Deactivates the category and its entire subtree (all child categories recursively).
     * All event types within deactivated categories are deactivated as well.
     * Historical events are preserved.
     *
     * @param categoryId
     * @returns void
     * @throws ApiError
     */
    public static deactivateEventCategory(
        categoryId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/events/categories/{categoryId}/deactivate',
            path: {
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
     * Reactivate event category
     * Requires administrator privileges.
     * Reactivates the category and its subtree (all child categories recursively).
     * Event types within reactivated categories are also reactivated.
     *
     * @param categoryId
     * @returns void
     * @throws ApiError
     */
    public static reactivateEventCategory(
        categoryId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/events/categories/{categoryId}/reactivate',
            path: {
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
     * List of event types in category
     * @param categoryId
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns EventTypeListResponse List of event types
     * @throws ApiError
     */
    public static listEventCategoryTypes(
        categoryId: string,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<EventTypeListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/events/categories/{categoryId}/types',
            path: {
                'categoryId': categoryId,
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
     * Create event type in category
     * Requires administrator privileges.
     * @param categoryId
     * @param requestBody
     * @returns EventType Resource created
     * @throws ApiError
     */
    public static createEventType(
        categoryId: string,
        requestBody: CreateEventTypeRequest,
    ): CancelablePromise<EventType> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/events/categories/{categoryId}/types',
            path: {
                'categoryId': categoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Resource state conflict`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get event type by ID
     * Deactivated types (including those deactivated recursively by parent category) return 404.
     *
     * @param typeId
     * @returns EventType Event type
     * @throws ApiError
     */
    public static getEventTypeById(
        typeId: string,
    ): CancelablePromise<EventType> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/events/types/{typeId}',
            path: {
                'typeId': typeId,
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
     * Update event type
     * Requires administrator privileges.
     * @param typeId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateEventType(
        typeId: string,
        requestBody: UpdateEventTypeRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/events/types/{typeId}',
            path: {
                'typeId': typeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete event type
     * Requires administrator privileges.
     * @param typeId
     * @returns void
     * @throws ApiError
     */
    public static deleteEventType(
        typeId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/events/types/{typeId}',
            path: {
                'typeId': typeId,
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
     * Deactivate event type
     * Requires administrator privileges.
     * Deactivates event type without deleting historical data.
     *
     * @param typeId
     * @returns void
     * @throws ApiError
     */
    public static deactivateEventType(
        typeId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/events/types/{typeId}/deactivate',
            path: {
                'typeId': typeId,
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
     * Reactivate event type
     * Requires administrator privileges.
     * Returns event type to active state.
     *
     * @param typeId
     * @returns void
     * @throws ApiError
     */
    public static reactivateEventType(
        typeId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/events/types/{typeId}/reactivate',
            path: {
                'typeId': typeId,
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
     * Get event types for event registration
     * Requires administrator privileges.
     * Returns active event types for selection during event registration/editing.
     * A type always belongs to a category.
     * Supports filtering by category, patientCanReport flag, search, and pagination.
     *
     * @param categoryId Filter by category.
     * @param patientCanReport Filter by patient availability flag.
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns EventTypeListResponse List of available event types
     * @throws ApiError
     */
    public static listEventTypes(
        categoryId?: string,
        patientCanReport?: boolean,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<EventTypeListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/events/types',
            query: {
                'categoryId': categoryId,
                'patientCanReport': patientCanReport,
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
}
