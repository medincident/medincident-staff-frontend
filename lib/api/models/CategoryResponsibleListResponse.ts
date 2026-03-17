/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CursorPagination } from './CursorPagination';
import type { ResponsibleWithSource } from './ResponsibleWithSource';
export type CategoryResponsibleListResponse = {
    /**
     * List of responsibles for the category within the organization context.
     * Includes responsibles assigned directly to the category,
     * as well as responsibles inherited from the parent category.
     *
     */
    items: Array<ResponsibleWithSource>;
    pagination: CursorPagination;
};

