/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryOrgstructureV1Point } from './queryOrgstructureV1Point';
/**
 * Address is the read-side view of a stored postal address; Point is
 * optional because the command-side allows text-only addresses.
 */
export type queryOrgstructureV1Address = {
    text?: string;
    point?: queryOrgstructureV1Point;
};

