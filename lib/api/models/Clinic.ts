/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { ClinicBrief } from './ClinicBrief';
export type Clinic = (ClinicBrief & {
    organizationId?: string;
    description?: string | null;
    physicalAddress?: Address;
} & {
    organizationId: string;
    physicalAddress: Address;
});

