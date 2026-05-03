/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1Address } from './v1Address';
/**
 * Organization mirrors the projections.organizations row returned by
 * GetOrganization. Timestamps are RFC3339 strings.
 */
export type v1Organization = {
    id?: string;
    name?: string;
    description?: string;
    legalAddress?: v1Address;
    createdAt?: string;
    updatedAt?: string;
};

