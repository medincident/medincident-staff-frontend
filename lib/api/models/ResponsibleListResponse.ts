/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CursorPagination } from './CursorPagination';
import type { ResponsibleWithSource } from './ResponsibleWithSource';
export type ResponsibleListResponse = {
    /**
     * List of responsibles, including those inherited from parent organizational units.
     * Responsibles with isDirectlyAssigned=true are assigned directly and are available for editing/removal.
     * Responsibles with isDirectlyAssigned=false are inherited from a parent unit (specified in inheritedFrom) and are not available for editing/removal at this level.
     *
     */
    items: Array<ResponsibleWithSource>;
    pagination: CursorPagination;
};

