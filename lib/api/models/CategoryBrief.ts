/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CategoryBrief = {
    id: string;
    /**
     * Parent category identifier. null for root categories.
     */
    parentId?: string | null;
    code: string;
    name: string;
    isActive?: boolean | null;
};

