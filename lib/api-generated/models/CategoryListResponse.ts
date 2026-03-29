/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryBrief } from './CategoryBrief';
import type { CursorPagination } from './CursorPagination';
export type CategoryListResponse = {
    /**
     * Flat list of categories in depth-first traversal order.
     * UI uses parentId of each category to reconstruct the tree.
     *
     */
    items: Array<CategoryBrief>;
    pagination: CursorPagination;
};

