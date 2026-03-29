/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Employment } from './Employment';
import type { UserBrief } from './UserBrief';
import type { UserNameFields } from './UserNameFields';
export type User = (UserBrief & UserNameFields & {
    employment?: Employment | null;
    /**
     * Administrator flag. Only returned to users with administrator privileges.
     */
    isAdmin?: boolean | null;
});

