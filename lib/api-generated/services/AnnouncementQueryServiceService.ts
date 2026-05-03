/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetAnnouncementResponse } from '../models/v1GetAnnouncementResponse';
import type { v1ListAnnouncementsForClinicResponse } from '../models/v1ListAnnouncementsForClinicResponse';
import type { v1ListAnnouncementsForDepartmentResponse } from '../models/v1ListAnnouncementsForDepartmentResponse';
import type { v1ListAnnouncementsForOrganizationResponse } from '../models/v1ListAnnouncementsForOrganizationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnnouncementQueryServiceService {
    /**
     * @param id
     * @returns v1GetAnnouncementResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryServiceGetAnnouncement(
        id: string,
    ): CancelablePromise<v1GetAnnouncementResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/query/announcements/{id}',
            path: {
                'id': id,
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
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryServiceListAnnouncementsForClinic(
        clinicId: string,
        includeArchived?: boolean,
        priority: 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED' | 'ANNOUNCEMENT_PRIORITY_NORMAL' | 'ANNOUNCEMENT_PRIORITY_HIGH' = 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED',
        limit?: number,
        cursor?: string,
    ): CancelablePromise<v1ListAnnouncementsForClinicResponse | rpcStatus> {
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
        });
    }
    /**
     * @param departmentId
     * @param includeArchived
     * @param priority
     * @param limit
     * @param cursor
     * @returns v1ListAnnouncementsForDepartmentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryServiceListAnnouncementsForDepartment(
        departmentId: string,
        includeArchived?: boolean,
        priority: 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED' | 'ANNOUNCEMENT_PRIORITY_NORMAL' | 'ANNOUNCEMENT_PRIORITY_HIGH' = 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED',
        limit?: number,
        cursor?: string,
    ): CancelablePromise<v1ListAnnouncementsForDepartmentResponse | rpcStatus> {
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
        });
    }
    /**
     * @param organizationId
     * @param includeArchived
     * @param priority UNSPECIFIED = all
     * @param limit
     * @param cursor
     * @returns v1ListAnnouncementsForOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static announcementQueryServiceListAnnouncementsForOrganization(
        organizationId: string,
        includeArchived?: boolean,
        priority: 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED' | 'ANNOUNCEMENT_PRIORITY_NORMAL' | 'ANNOUNCEMENT_PRIORITY_HIGH' = 'ANNOUNCEMENT_PRIORITY_UNSPECIFIED',
        limit?: number,
        cursor?: string,
    ): CancelablePromise<v1ListAnnouncementsForOrganizationResponse | rpcStatus> {
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
        });
    }
}
