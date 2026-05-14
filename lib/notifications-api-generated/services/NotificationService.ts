/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationServiceMarkAsReadBody } from '../models/NotificationServiceMarkAsReadBody';
import type { v1GetQuietHoursResponse } from '../models/v1GetQuietHoursResponse';
import type { v1GetSettingsResponse } from '../models/v1GetSettingsResponse';
import type { v1GetUnreadCountResponse } from '../models/v1GetUnreadCountResponse';
import type { v1ListNotificationsResponse } from '../models/v1ListNotificationsResponse';
import type { v1MarkAllAsReadRequest } from '../models/v1MarkAllAsReadRequest';
import type { v1MarkAllAsReadResponse } from '../models/v1MarkAllAsReadResponse';
import type { v1MarkAsReadResponse } from '../models/v1MarkAsReadResponse';
import type { v1UpdateQuietHoursRequest } from '../models/v1UpdateQuietHoursRequest';
import type { v1UpdateQuietHoursResponse } from '../models/v1UpdateQuietHoursResponse';
import type { v1UpdateSettingsRequest } from '../models/v1UpdateSettingsRequest';
import type { v1UpdateSettingsResponse } from '../models/v1UpdateSettingsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationService {
    /**
     * ListNotifications returns the caller's notifications with cursor pagination.
     * @param cursor
     * @param limit
     * @param unreadOnly
     * @returns v1ListNotificationsResponse A successful response.
     * @throws ApiError
     */
    public static notificationListNotifications(
        cursor?: string,
        limit?: number,
        unreadOnly?: boolean,
    ): CancelablePromise<v1ListNotificationsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications',
            query: {
                'cursor': cursor,
                'limit': limit,
                'unreadOnly': unreadOnly,
            },
        });
    }
    /**
     * GetQuietHours returns the caller's quiet hours configuration.
     * @returns v1GetQuietHoursResponse A successful response.
     * @throws ApiError
     */
    public static notificationGetQuietHours(): CancelablePromise<v1GetQuietHoursResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/quiet-hours',
        });
    }
    /**
     * UpdateQuietHours upserts the caller's quiet hours configuration.
     * @param body
     * @returns v1UpdateQuietHoursResponse A successful response.
     * @throws ApiError
     */
    public static notificationUpdateQuietHours(
        body: v1UpdateQuietHoursRequest,
    ): CancelablePromise<v1UpdateQuietHoursResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/notifications/quiet-hours',
            body: body,
        });
    }
    /**
     * MarkAllAsRead marks all of the caller's notifications as read.
     * @param body
     * @returns v1MarkAllAsReadResponse A successful response.
     * @throws ApiError
     */
    public static notificationMarkAllAsRead(
        body: v1MarkAllAsReadRequest,
    ): CancelablePromise<v1MarkAllAsReadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/read-all',
            body: body,
        });
    }
    /**
     * GetSettings returns all notification type settings for the caller.
     * @returns v1GetSettingsResponse A successful response.
     * @throws ApiError
     */
    public static notificationGetSettings(): CancelablePromise<v1GetSettingsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/settings',
        });
    }
    /**
     * UpdateSettings upserts notification type settings for the caller.
     * @param body
     * @returns v1UpdateSettingsResponse A successful response.
     * @throws ApiError
     */
    public static notificationUpdateSettings(
        body: v1UpdateSettingsRequest,
    ): CancelablePromise<v1UpdateSettingsResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/notifications/settings',
            body: body,
        });
    }
    /**
     * GetUnreadCount returns the count of unread notifications.
     * @returns v1GetUnreadCountResponse A successful response.
     * @throws ApiError
     */
    public static notificationGetUnreadCount(): CancelablePromise<v1GetUnreadCountResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/unread-count',
        });
    }
    /**
     * MarkAsRead marks a single notification as read.
     * @param id
     * @param body
     * @returns v1MarkAsReadResponse A successful response.
     * @throws ApiError
     */
    public static notificationMarkAsRead(
        id: string,
        body: NotificationServiceMarkAsReadBody,
    ): CancelablePromise<v1MarkAsReadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/{id}/read',
            path: {
                'id': id,
            },
            body: body,
        });
    }
}
