/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ValidationFailedDetailsFieldViolation } from './ValidationFailedDetailsFieldViolation';
/**
 * ValidationFailedDetails is present only when code = "validation_failed".
 * Each violation corresponds to one struct-tag rule failure or one
 * domain-level leaf error from errors.Join.
 */
export type v1ValidationFailedDetails = {
    violations?: Array<ValidationFailedDetailsFieldViolation>;
};

