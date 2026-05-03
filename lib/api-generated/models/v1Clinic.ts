/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1Address } from './v1Address';
/**
 * Clinic mirrors the projections.clinics row returned by GetClinic.
 */
export type v1Clinic = {
    id?: string;
    organizationId?: string;
    name?: string;
    description?: string;
    physicalAddress?: v1Address;
    createdAt?: string;
    updatedAt?: string;
};

