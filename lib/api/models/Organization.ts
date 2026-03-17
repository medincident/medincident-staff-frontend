/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { OrganizationBrief } from './OrganizationBrief';
export type Organization = (OrganizationBrief & {
    description?: string | null;
    legalAddress: Address;
});

