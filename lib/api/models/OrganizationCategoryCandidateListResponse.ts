/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CursorPagination } from './CursorPagination';
import type { OrganizationCategoryCandidate } from './OrganizationCategoryCandidate';
export type OrganizationCategoryCandidateListResponse = {
    /**
     * Flat list of category candidates in depth-first traversal order.
     * UI uses category.parentId to reconstruct the tree.
     *
     */
    items: Array<OrganizationCategoryCandidate>;
    pagination: CursorPagination;
};

