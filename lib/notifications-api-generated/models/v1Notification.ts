/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1NotificationType } from './v1NotificationType';
/**
 * Notification is a single notification entry.
 */
export type v1Notification = {
    id?: string;
    type?: v1NotificationType;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    isSecurity?: boolean;
    isRead?: boolean;
    readAt?: string;
    createdAt?: string;
};

