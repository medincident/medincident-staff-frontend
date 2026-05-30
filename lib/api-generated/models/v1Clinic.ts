/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryOrgstructureV1Address } from './queryOrgstructureV1Address';
/**
 * Clinic mirrors the projections.clinics row returned by GetClinic.
 */
export type v1Clinic = {
    id?: string;
    organizationId?: string;
    name?: string;
    description?: string;
    physicalAddress?: queryOrgstructureV1Address;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

