/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IneligibilityReasonCode } from './IneligibilityReasonCode';
/**
 * Filter for ineligibility reasons of candidates.
 * Applied when includeIneligible=true.
 * If the user is not an employee, only the cause `not_an_employee` is returned.
 * For employees, reasons `different_organization`, `different_clinic`, `different_department` are used.
 *
 */
export type IneligibilityReasonCodes = Array<IneligibilityReasonCode>;
