/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnnouncementCommandServiceUpdateAnnouncementBody } from '../models/AnnouncementCommandServiceUpdateAnnouncementBody';
import type { AnnouncementCommandServiceUpdateAnnouncementPriorityBody } from '../models/AnnouncementCommandServiceUpdateAnnouncementPriorityBody';
import type { v1ArchiveAnnouncementResponse } from '../models/v1ArchiveAnnouncementResponse';
import type { v1CreateAnnouncementRequest } from '../models/v1CreateAnnouncementRequest';
import type { v1CreateAnnouncementResponse } from '../models/v1CreateAnnouncementResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1UnarchiveAnnouncementResponse } from '../models/v1UnarchiveAnnouncementResponse';
import type { v1UpdateAnnouncementPriorityResponse } from '../models/v1UpdateAnnouncementPriorityResponse';
import type { v1UpdateAnnouncementResponse } from '../models/v1UpdateAnnouncementResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnnouncementCommandService {
    /**
     * @param body
     * @returns v1CreateAnnouncementResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandCreateAnnouncement(
        body: v1CreateAnnouncementRequest,
    ): CancelablePromise<v1CreateAnnouncementResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/announcements',
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`announcement_organization_not_found\` — organization with the given ID does not exist.
                - \`announcement_clinic_not_found\` — clinic with the given ID does not exist.
                - \`announcement_department_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @param body
     * @returns v1UpdateAnnouncementResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandUpdateAnnouncement(
        id: string,
        body: AnnouncementCommandServiceUpdateAnnouncementBody,
    ): CancelablePromise<v1UpdateAnnouncementResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/announcements/{id}',
            path: {
                'id': id,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`announcement_not_found\` — announcement with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`announcement_archived\` — announcement is archived and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @param body
     * @returns v1UpdateAnnouncementPriorityResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandUpdateAnnouncementPriority(
        id: string,
        body: AnnouncementCommandServiceUpdateAnnouncementPriorityBody,
    ): CancelablePromise<v1UpdateAnnouncementPriorityResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/announcements/{id}/priority',
            path: {
                'id': id,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`announcement_not_found\` — announcement with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`announcement_archived\` — announcement is archived and cannot be modified.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1ArchiveAnnouncementResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandArchiveAnnouncement(
        id: string,
    ): CancelablePromise<v1ArchiveAnnouncementResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/announcements/{id}:archive',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`announcement_not_found\` — announcement with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1UnarchiveAnnouncementResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementCommandUnarchiveAnnouncement(
        id: string,
    ): CancelablePromise<v1UnarchiveAnnouncementResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/announcements/{id}:unarchive',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`announcement_not_found\` — announcement with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
