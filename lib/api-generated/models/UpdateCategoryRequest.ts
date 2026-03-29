/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateCategoryRequest = {
    /**
     * New parent of the category. null makes the category a root one.
     */
    parentId?: string | null;
    name?: string;
    description?: string | null;
    isActive?: boolean;
};

