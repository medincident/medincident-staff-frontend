/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1Category } from './v1Category';
/**
 * ListCategorySubtreeResponse returns the full subtree rooted at the
 * requested category. No pagination — the subtree depth is bounded and
 * the full result is always returned.
 */
export type v1ListCategorySubtreeResponse = {
    items?: Array<v1Category>;
};

