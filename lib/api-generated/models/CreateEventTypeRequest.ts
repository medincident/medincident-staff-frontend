/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateEventTypeRequest = {
    code: string;
    name: string;
    description?: string | null;
    /**
     * Whether a patient can create a complaint/report with this event type.
     */
    patientCanReport: boolean;
};

