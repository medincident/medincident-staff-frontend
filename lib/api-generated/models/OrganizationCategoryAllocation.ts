/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryBrief } from './CategoryBrief';
export type OrganizationCategoryAllocation = {
    category: CategoryBrief;
    /**
     * true — category is explicitly enabled for this organization.
     * false — category is enabled via inheritance from a parent category.
     *
     */
    isDirectlyEnabled: boolean;
    /**
     * Parent category from which this permission is inherited.
     * Not null only when isDirectlyEnabled=false.
     *
     */
    enabledFrom?: CategoryBrief | null;
};

