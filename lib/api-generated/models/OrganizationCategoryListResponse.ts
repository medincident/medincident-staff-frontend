/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CursorPagination } from './CursorPagination';
import type { OrganizationCategoryAllocation } from './OrganizationCategoryAllocation';
export type OrganizationCategoryListResponse = {
    /**
     * Flat list of categories allowed for the organization (explicitly and via inheritance),
     * in depth-first traversal order.
     * UI uses category.parentId to reconstruct the tree.
     *
     */
    items: Array<OrganizationCategoryAllocation>;
    pagination: CursorPagination;
};

