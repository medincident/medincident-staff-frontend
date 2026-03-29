/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IneligibilityReasonCode } from './IneligibilityReasonCode';
import type { InheritedFromSource } from './InheritedFromSource';
export type IneligibilityReason = {
    code: IneligibilityReasonCode;
    message: string;
    /**
     * Information about the organizational unit where the user is (or is not) located.
     * Filled in for codes different_organization, different_clinic, different_department.
     * Shows where the user is actually located (organization/clinic/department), thus explaining the incompatibility.
     * Null for code not_an_employee (user is not an employee at all).
     *
     */
    source?: InheritedFromSource | null;
};

