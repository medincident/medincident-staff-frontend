/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1Point } from './v1Point';
/**
 * Address is the read-side view of a stored postal address; Point is
 * optional because the command-side allows text-only addresses.
 */
export type v1Address = {
    text?: string;
    point?: v1Point;
};

