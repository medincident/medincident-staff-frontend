/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCategoryRequest = {
    /**
     * Parent category identifier. If null, a root category is created.
     */
    parentId?: string | null;
    code: string;
    name: string;
    description?: string | null;
};

