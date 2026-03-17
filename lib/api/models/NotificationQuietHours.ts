/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationQuietHours = {
    enabled: boolean;
    /**
     * Required when enabled=true.
     */
    start?: string | null;
    /**
     * Required when enabled=true.
     */
    end?: string | null;
    timezone?: string;
};

