/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationQuietHours } from './NotificationQuietHours';
import type { NotificationRule } from './NotificationRule';
import type { NotificationSchedule } from './NotificationSchedule';
export type NotificationSettings = {
    rules: Array<NotificationRule>;
    quietHours: NotificationQuietHours;
    schedule: NotificationSchedule;
};

