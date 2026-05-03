/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryAnnouncementV1AnnouncementPriority } from './queryAnnouncementV1AnnouncementPriority';
export type v1AnnouncementView = {
    id?: string;
    organizationId?: string;
    clinicId?: string;
    departmentId?: string;
    authorId?: string;
    title?: string;
    content?: string;
    priority?: queryAnnouncementV1AnnouncementPriority;
    isArchived?: boolean;
    startsAt?: string;
    endsAt?: string;
    createdAt?: string;
    updatedAt?: string;
    viewCount?: string;
};

