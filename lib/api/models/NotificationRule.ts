/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationChannel } from './NotificationChannel';
import type { NotificationEventType } from './NotificationEventType';
export type NotificationRule = {
    channel: NotificationChannel;
    enabled: boolean;
    eventTypes: Array<NotificationEventType>;
};

