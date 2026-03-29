/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserNameBrief } from './UserNameBrief';
export type UserBrief = ({
    /**
     * Unique user identifier.
     */
    id: string;
    /**
     * User image URL. Only returned if set.
     */
    picture?: string | null;
    email?: string | null;
    /**
     * User activity flag. Only returned to administrators.
     */
    isActive?: boolean | null;
} & UserNameBrief);

