/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IneligibilityReason } from './IneligibilityReason';
import type { UserBrief } from './UserBrief';
export type ResponsibleCandidate = {
    user: UserBrief;
    eligible: boolean;
    ineligibilityReasons: Array<IneligibilityReason>;
};

