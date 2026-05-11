/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ValidationFailedDetails } from './v1ValidationFailedDetails';
/**
 * Error response body returned by the gateway for all HTTP errors.
 *
 * `code` is always a machine-readable domain string (e.g. `employee_not_found`, `validation_failed`).
 *
 * `details` is present only when `code = validation_failed` and contains the list of field violations.
 */
export type v1ErrorResponse = {
    code?: string;
    message?: string;
    details?: v1ValidationFailedDetails;
};

