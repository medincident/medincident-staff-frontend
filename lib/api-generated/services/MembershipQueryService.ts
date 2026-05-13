/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1CountEmployeesByClinicResponse } from '../models/v1CountEmployeesByClinicResponse';
import type { v1CountEmployeesByDepartmentResponse } from '../models/v1CountEmployeesByDepartmentResponse';
import type { v1CountEmployeesByOrganizationResponse } from '../models/v1CountEmployeesByOrganizationResponse';
import type { v1CountVacationsByEmployeeResponse } from '../models/v1CountVacationsByEmployeeResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1GetClinicHeadResponse } from '../models/v1GetClinicHeadResponse';
import type { v1GetDepartmentResponsibleResponse } from '../models/v1GetDepartmentResponsibleResponse';
import type { v1GetEmployeeResponse } from '../models/v1GetEmployeeResponse';
import type { v1ListCandidatesForClinicHeadResponse } from '../models/v1ListCandidatesForClinicHeadResponse';
import type { v1ListCandidatesForDeptResponsibleResponse } from '../models/v1ListCandidatesForDeptResponsibleResponse';
import type { v1ListCandidatesForHireResponse } from '../models/v1ListCandidatesForHireResponse';
import type { v1ListCandidatesForOrgAdminResponse } from '../models/v1ListCandidatesForOrgAdminResponse';
import type { v1ListCandidatesForOrgDispatcherResponse } from '../models/v1ListCandidatesForOrgDispatcherResponse';
import type { v1ListCandidatesForOrgHeadResponse } from '../models/v1ListCandidatesForOrgHeadResponse';
import type { v1ListCandidatesForSystemAdminResponse } from '../models/v1ListCandidatesForSystemAdminResponse';
import type { v1ListEmployeesByClinicResponse } from '../models/v1ListEmployeesByClinicResponse';
import type { v1ListEmployeesByDepartmentResponse } from '../models/v1ListEmployeesByDepartmentResponse';
import type { v1ListEmployeesByOrganizationResponse } from '../models/v1ListEmployeesByOrganizationResponse';
import type { v1ListOrgAdminsResponse } from '../models/v1ListOrgAdminsResponse';
import type { v1ListOrgDispatchersResponse } from '../models/v1ListOrgDispatchersResponse';
import type { v1ListOrgHeadsResponse } from '../models/v1ListOrgHeadsResponse';
import type { v1ListSystemAdminsResponse } from '../models/v1ListSystemAdminsResponse';
import type { v1ListVacationsByEmployeeResponse } from '../models/v1ListVacationsByEmployeeResponse';
import type { v1SearchEmployeesByOrganizationResponse } from '../models/v1SearchEmployeesByOrganizationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MembershipQueryService {
    /**
     * @param clinicId
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after
     * @param limit
     * @returns v1ListCandidatesForClinicHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForClinicHead(
        clinicId: string,
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForClinicHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/candidates:clinic-head',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param limit
     * @param after
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1ListEmployeesByClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListEmployeesByClinic(
        clinicId: string,
        limit?: number,
        after?: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1ListEmployeesByClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/employees',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1CountEmployeesByClinicResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryCountEmployeesByClinic(
        clinicId: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1CountEmployeesByClinicResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/employees:count',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @returns v1GetClinicHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryGetClinicHead(
        clinicId: string,
    ): CancelablePromise<v1GetClinicHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/head',
            path: {
                'clinicId': clinicId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after
     * @param limit
     * @returns v1ListCandidatesForDeptResponsibleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForDeptResponsible(
        departmentId: string,
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForDeptResponsibleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/candidates:dept-responsible',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param limit
     * @param after
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1ListEmployeesByDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListEmployeesByDepartment(
        departmentId: string,
        limit?: number,
        after?: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1ListEmployeesByDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/employees',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1CountEmployeesByDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryCountEmployeesByDepartment(
        departmentId: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1CountEmployeesByDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/employees:count',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @returns v1GetDepartmentResponsibleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryGetDepartmentResponsible(
        departmentId: string,
    ): CancelablePromise<v1GetDepartmentResponsibleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/responsible',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param employeeId
     * @param state Optional state filter. When empty, all states are returned.
     * Valid values: scheduled, active, ended, cancelled.
     * @param limit
     * @param after
     * @returns v1ListVacationsByEmployeeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListVacationsByEmployee(
        employeeId: string,
        state?: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListVacationsByEmployeeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/employees/{employeeId}/vacations',
            path: {
                'employeeId': employeeId,
            },
            query: {
                'state': state,
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param employeeId
     * @param state Optional state filter. When empty, counts all states.
     * Valid values: scheduled, active, ended, cancelled.
     * @returns v1CountVacationsByEmployeeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryCountVacationsByEmployee(
        employeeId: string,
        state?: string,
    ): CancelablePromise<v1CountVacationsByEmployeeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/employees/{employeeId}/vacations:count',
            path: {
                'employeeId': employeeId,
            },
            query: {
                'state': state,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetEmployeeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryGetEmployee(
        id: string,
    ): CancelablePromise<v1GetEmployeeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/employees/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`employee_card_not_found\` — employee with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @returns v1ListOrgAdminsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListOrgAdmins(
        organizationId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListOrgAdminsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/admins',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after Opaque cursor from next_cursor of a previous response. Empty = first page.
     * @param limit Page size. 0 → default 50. Range [1, 500].
     * @returns v1ListCandidatesForHireResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForHire(
        organizationId: string,
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForHireResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/candidates:hire',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after
     * @param limit
     * @returns v1ListCandidatesForOrgAdminResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForOrgAdmin(
        organizationId: string,
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForOrgAdminResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/candidates:org-admin',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after
     * @param limit
     * @returns v1ListCandidatesForOrgDispatcherResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForOrgDispatcher(
        organizationId: string,
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForOrgDispatcherResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/candidates:org-dispatcher',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after
     * @param limit
     * @returns v1ListCandidatesForOrgHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForOrgHead(
        organizationId: string,
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForOrgHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/candidates:org-head',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @returns v1ListOrgDispatchersResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListOrgDispatchers(
        organizationId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListOrgDispatchersResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/dispatchers',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1ListEmployeesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListEmployeesByOrganization(
        organizationId: string,
        limit?: number,
        after?: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1ListEmployeesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/employees',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1CountEmployeesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryCountEmployeesByOrganization(
        organizationId: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1CountEmployeesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/employees:count',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param query Fuzzy substring matched case-insensitively (ILIKE %query%) against
     * first_name, last_name, display_name, and email. Trimmed at the
     * handler boundary; an empty query degenerates to the same behaviour
     * as ListEmployeesByOrganization with the same filters. Maximum
     * length 256 characters; over-long inputs are rejected before the
     * authz round-trip.
     * @param limit
     * @param after
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1SearchEmployeesByOrganizationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQuerySearchEmployeesByOrganization(
        organizationId: string,
        query?: string,
        limit?: number,
        after?: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1SearchEmployeesByOrganizationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/employees:search',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'query': query,
                'limit': limit,
                'after': after,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param after
     * @returns v1ListOrgHeadsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListOrgHeads(
        organizationId: string,
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListOrgHeadsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/heads',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param limit
     * @param after
     * @returns v1ListSystemAdminsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListSystemAdmins(
        limit?: number,
        after?: string,
    ): CancelablePromise<v1ListSystemAdminsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/system-admins',
            query: {
                'limit': limit,
                'after': after,
            },
            errors: {
                400: `Validation failed. Error codes:
                - \`membership_bad_cursor\` — pagination cursor is invalid or malformed.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param query Optional substring search (ILIKE %query%) on first_name, last_name,
     * display_name, email. Trimmed at the handler boundary. Max 256 chars.
     * @param after
     * @param limit
     * @returns v1ListCandidatesForSystemAdminResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryListCandidatesForSystemAdmin(
        query?: string,
        after?: string,
        limit?: number,
    ): CancelablePromise<v1ListCandidatesForSystemAdminResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/system-admins/candidates',
            query: {
                'query': query,
                'after': after,
                'limit': limit,
            },
            errors: {
                400: `Invalid input. Error codes:
                - \`candidate_search_query_too_long\` — search query exceeds 256 characters.
                - \`invalid_cursor\` — cursor is malformed.
                - \`list_limit_out_of_range\` — limit outside [1, 500].`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                500: `Internal server error. Error codes:
                - \`candidate_load_failed\` — database query failed.`,
            },
        });
    }
}
