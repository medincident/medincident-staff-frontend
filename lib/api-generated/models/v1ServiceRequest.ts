/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1Executor } from './v1Executor';
export type v1ServiceRequest = {
    id?: string;
    organizationId?: string;
    clinicId?: string;
    departmentId?: string;
    typeId?: string;
    incidentId?: string;
    description?: string;
    status?: string;
    authorId?: string;
    authorDisplayName?: string;
    executors?: Array<v1Executor>;
    createdAt?: string;
    updatedAt?: string;
};

