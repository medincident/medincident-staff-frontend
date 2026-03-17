/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryBrief } from './CategoryBrief';
import type { CategoryCandidateIneligibilityReason } from './CategoryCandidateIneligibilityReason';
export type OrganizationCategoryCandidate = {
    category: CategoryBrief;
    /**
     * true — category can be enabled for the organization.
     * false — category cannot be enabled (e.g., already enabled directly or via inheritance).
     *
     */
    eligible: boolean;
    ineligibilityReasons: Array<CategoryCandidateIneligibilityReason>;
    /**
     * Number of direct child categories.
     */
    childrenCount: number;
};

