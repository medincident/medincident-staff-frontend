/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationSettings } from '../models/NotificationSettings';
import type { UpdateUserDisplayNameRequest } from '../models/UpdateUserDisplayNameRequest';
import type { User } from '../models/User';
import type { UserListResponse } from '../models/UserListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Current user profile
     * @returns User User profile
     * @throws ApiError
     */
    public static getMe(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
            errors: {
                401: `User unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get notification settings
     * @returns NotificationSettings Current notification settings
     * @throws ApiError
     */
    public static getMyNotificationSettings(): CancelablePromise<NotificationSettings> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me/settings/notifications',
            errors: {
                401: `User unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update notification settings
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateMyNotificationSettings(
        requestBody: NotificationSettings,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/me/settings/notifications',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get list of all users
     * Requires administrator privileges.
     * Supports cursor pagination for iterating through all users.
     * By default, deactivated users are not shown (behavior similar to deleted).
     * When includeDeactivated=true, deactivated users are also returned.
     *
     * @param includeDeactivated Whether to include deactivated entities in the result.
     * Default is false — only active entities are returned.
     *
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns UserListResponse List of users
     * @throws ApiError
     */
    public static listUsers(
        includeDeactivated: boolean = false,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<UserListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
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
     * Get user by ID
     * Requires administrator privileges.
     * Returns detailed user information and whether the user is an administrator.
     *
     * @param userId
     * @returns User Detailed user information
     * @throws ApiError
     */
    public static getUserById(
        userId: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userId}',
            path: {
                'userId': userId,
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
     * Delete user
     * Requires administrator privileges.
     * Deletion is allowed only when system business rules are met.
     *
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static deleteUser(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{userId}',
            path: {
                'userId': userId,
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
     * Set user display name
     * Requires administrator privileges.
     * Used to correct an incorrect username.
     *
     * @param userId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateUserDisplayName(
        userId: string,
        requestBody: UpdateUserDisplayNameRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{userId}/display-name',
            path: {
                'userId': userId,
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
     * Reset custom user display name
     * Requires administrator privileges.
     * Removes the custom display name and restores the original username.
     *
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static clearUserDisplayName(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{userId}/display-name',
            path: {
                'userId': userId,
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
     * Deactivate user
     * Requires administrator privileges.
     * After deaсtivation, the user does not participate in operational processes and is not returned
     * in regular lists without includeDeactivated=true.
     * Historical data (events, chats, assignments) is preserved.
     *
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static deactivateUser(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userId}/deactivate',
            path: {
                'userId': userId,
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
     * Reactivate user
     * Requires administrator privileges.
     * Returns the user to an active state.
     *
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static reactivateUser(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userId}/reactivate',
            path: {
                'userId': userId,
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
}
