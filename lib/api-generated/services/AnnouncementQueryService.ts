/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetAnnouncementResponse } from '../models/v1GetAnnouncementResponse';
import type { v1ListAnnouncementsForClinicResponse } from '../models/v1ListAnnouncementsForClinicResponse';
import type { v1ListAnnouncementsForDepartmentResponse } from '../models/v1ListAnnouncementsForDepartmentResponse';
import type { v1ListAnnouncementsForOrganizationResponse } from '../models/v1ListAnnouncementsForOrganizationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnnouncementQueryService {
    /**
     * @param id
     * @returns v1GetAnnouncementResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryGetAnnouncement(
        id: string,
    ): CancelablePromise<v1GetAnnouncementResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/announcements/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`announcement_query_not_found\` — announcement with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param includeArchived
     * @param priority
     * @param limit
     * @param cursor
     * @returns v1ListAnnouncementsForClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryListAnnouncementsForClinic(
        clinicId: string,
        includeArchived?: boolean,
        priority: 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED' | 'ANNOUNCEMENT_PRIORITY_NORMAL' | 'ANNOUNCEMENT_PRIORITY_HIGH' = 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED',
        limit?: number,
        cursor?: string,
    ): CancelablePromise<v1ListAnnouncementsForClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/clinics/{clinicId}/announcements',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'includeArchived': includeArchived,
                'priority': priority,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`announcement_query_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param includeArchived
     * @param priority
     * @param limit
     * @param cursor
     * @returns v1ListAnnouncementsForDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryListAnnouncementsForDepartment(
        departmentId: string,
        includeArchived?: boolean,
        priority: 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED' | 'ANNOUNCEMENT_PRIORITY_NORMAL' | 'ANNOUNCEMENT_PRIORITY_HIGH' = 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED',
        limit?: number,
        cursor?: string,
    ): CancelablePromise<v1ListAnnouncementsForDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/departments/{departmentId}/announcements',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'includeArchived': includeArchived,
                'priority': priority,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`announcement_query_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param includeArchived
     * @param priority UNSPECIFIED = all
     * @param limit
     * @param cursor
     * @returns v1ListAnnouncementsForOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryListAnnouncementsForOrganization(
        organizationId: string,
        includeArchived?: boolean,
        priority: 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED' | 'ANNOUNCEMENT_PRIORITY_NORMAL' | 'ANNOUNCEMENT_PRIORITY_HIGH' = 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED',
        limit?: number,
        cursor?: string,
    ): CancelablePromise<v1ListAnnouncementsForOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/organizations/{organizationId}/announcements',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'includeArchived': includeArchived,
                'priority': priority,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`announcement_query_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
