/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryBrief } from './CategoryBrief';
import type { CategoryCandidateIneligibilityReasonCode } from './CategoryCandidateIneligibilityReasonCode';
export type CategoryCandidateIneligibilityReason = {
    code: CategoryCandidateIneligibilityReasonCode;
    message: string;
    /**
     * Source category of the ineligibility reason.
     * For example, a parent category through which the current permission is already inherited.
     *
     */
    source?: CategoryBrief | null;
};

