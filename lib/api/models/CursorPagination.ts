/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CursorPagination = {
    /**
     * Current position token (echo of the request).
     */
    cursor?: string | null;
    /**
     * Token for requesting the next page.
     */
    nextCursor?: string | null;
    limit: number;
    hasMore: boolean;
};

