/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1ZitadelUserView } from './v1ZitadelUserView';
export type v1ListCandidatesForHireResponse = {
    items?: Array<v1ZitadelUserView>;
    /**
     * Opaque cursor for the next page. Empty when this is the last page.
     */
    nextCursor?: string;
};

