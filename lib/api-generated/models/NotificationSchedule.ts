/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DayOfWeek } from './DayOfWeek';
export type NotificationSchedule = {
    /**
     * If true — notifications are sent only on days listed in activeDays.
     * If false — schedule is not applied, notifications are sent every day.
     *
     */
    enabled: boolean;
    /**
     * Days of the week when notifications are allowed.
     * Required when enabled=true. Ignored when enabled=false.
     *
     */
    activeDays?: Array<DayOfWeek> | null;
};

