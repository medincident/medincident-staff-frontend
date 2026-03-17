/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InheritedFromSource = {
    /**
     * Type of organizational unit or category from which responsibility is inherited
     */
    type: InheritedFromSource.type;
    id: string;
    /**
     * Name of the organizational unit or category
     */
    name: string;
};
export namespace InheritedFromSource {
    /**
     * Type of organizational unit or category from which responsibility is inherited
     */
    export enum type {
        ORGANIZATION = 'organization',
        CLINIC = 'clinic',
        DEPARTMENT = 'department',
        CATEGORY = 'category',
    }
}

