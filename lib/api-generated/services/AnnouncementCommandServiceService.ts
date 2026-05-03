/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnnouncementCommandServiceUpdateAnnouncementBody } from '../models/AnnouncementCommandServiceUpdateAnnouncementBody';
import type { AnnouncementCommandServiceUpdateAnnouncementPriorityBody } from '../models/AnnouncementCommandServiceUpdateAnnouncementPriorityBody';
import type { rpcStatus } from '../models/rpcStatus';
import type { v1ArchiveAnnouncementResponse } from '../models/v1ArchiveAnnouncementResponse';
import type { v1CreateAnnouncementRequest } from '../models/v1CreateAnnouncementRequest';
import type { v1CreateAnnouncementResponse } from '../models/v1CreateAnnouncementResponse';
import type { v1UnarchiveAnnouncementResponse } from '../models/v1UnarchiveAnnouncementResponse';
import type { v1UpdateAnnouncementPriorityResponse } from '../models/v1UpdateAnnouncementPriorityResponse';
import type { v1UpdateAnnouncementResponse } from '../models/v1UpdateAnnouncementResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnnouncementCommandServiceService {
    /**
     * @param body
     * @returns v1CreateAnnouncementResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandServiceCreateAnnouncement(
        body: v1CreateAnnouncementRequest,
    ): CancelablePromise<v1CreateAnnouncementResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/announcements',
            body: body,
        });
    }
    /**
     * @param id
     * @param body
     * @returns v1UpdateAnnouncementResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandServiceUpdateAnnouncement(
        id: string,
        body: AnnouncementCommandServiceUpdateAnnouncementBody,
    ): CancelablePromise<v1UpdateAnnouncementResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/announcements/{id}',
            path: {
                'id': id,
            },
            body: body,
        });
    }
    /**
     * @param id
     * @param body
     * @returns v1UpdateAnnouncementPriorityResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandServiceUpdateAnnouncementPriority(
        id: string,
        body: AnnouncementCommandServiceUpdateAnnouncementPriorityBody,
    ): CancelablePromise<v1UpdateAnnouncementPriorityResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/announcements/{id}/priority',
            path: {
                'id': id,
            },
            body: body,
        });
    }
    /**
     * @param id
     * @returns v1ArchiveAnnouncementResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandServiceArchiveAnnouncement(
        id: string,
    ): CancelablePromise<v1ArchiveAnnouncementResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/announcements/{id}:archive',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns v1UnarchiveAnnouncementResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandServiceUnarchiveAnnouncement(
        id: string,
    ): CancelablePromise<v1UnarchiveAnnouncementResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/announcements/{id}:unarchive',
            path: {
                'id': id,
            },
        });
    }
}
