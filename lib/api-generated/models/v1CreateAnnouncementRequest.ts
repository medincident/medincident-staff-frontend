/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { commandAnnouncementV1AnnouncementPriority } from './commandAnnouncementV1AnnouncementPriority';
export type v1CreateAnnouncementRequest = {
    organizationId: string;
    clinicId?: string;
    departmentId?: string;
    title: string;
    content: string;
    priority: commandAnnouncementV1AnnouncementPriority;
    startsAt?: string;
    endsAt?: string;
};

