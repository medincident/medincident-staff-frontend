/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1NotificationType } from './v1NotificationType';
/**
 * NotificationTypeSetting holds per-type delivery settings.
 */
export type v1NotificationTypeSetting = {
    type?: v1NotificationType;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
};

