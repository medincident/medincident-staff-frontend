/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InheritedFromSource } from './InheritedFromSource';
import type { UserBrief } from './UserBrief';
export type ResponsibleWithSource = {
    user: UserBrief;
    /**
     * true — responsible is assigned directly to this level and can be removed.
     * false — responsible is inherited from a parent organizational unit and cannot be removed at this level.
     *
     */
    isDirectlyAssigned: boolean;
    /**
     * Information about the organizational unit from which responsibility is inherited.
     * Not null only when isDirectlyAssigned=false.
     * Inherited responsibles cannot be edited or removed at this level.
     *
     */
    inheritedFrom?: InheritedFromSource | null;
};

