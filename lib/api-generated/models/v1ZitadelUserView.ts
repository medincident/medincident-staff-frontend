/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ZitadelUserView is a lightweight projection of projections.users used
 * by candidate-listing endpoints that operate on raw Zitadel identities
 * (ForHire, ForSystemAdmin). Fields mirror the NOT NULL columns of the
 * users table.
 */
export type v1ZitadelUserView = {
    zitadelUserId?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
};

