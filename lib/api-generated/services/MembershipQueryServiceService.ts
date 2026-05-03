/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CountEmployeesByClinicResponse } from '../models/v1CountEmployeesByClinicResponse';
import type { v1CountEmployeesByDepartmentResponse } from '../models/v1CountEmployeesByDepartmentResponse';
import type { v1CountEmployeesByOrganizationResponse } from '../models/v1CountEmployeesByOrganizationResponse';
import type { v1CountVacationsByEmployeeResponse } from '../models/v1CountVacationsByEmployeeResponse';
import type { v1GetClinicHeadResponse } from '../models/v1GetClinicHeadResponse';
import type { v1GetDepartmentResponsibleResponse } from '../models/v1GetDepartmentResponsibleResponse';
import type { v1GetEmployeeResponse } from '../models/v1GetEmployeeResponse';
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
export class MembershipQueryServiceService {
    /**
     * @param clinicId
     * @param limit
     * @param offset
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1ListEmployeesByClinicResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListEmployeesByClinic(
        clinicId: string,
        limit?: number,
        offset?: number,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1ListEmployeesByClinicResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/employees',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'limit': limit,
                'offset': offset,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
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
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceCountEmployeesByClinic(
        clinicId: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1CountEmployeesByClinicResponse | rpcStatus> {
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
        });
    }
    /**
     * @param clinicId
     * @returns v1GetClinicHeadResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceGetClinicHead(
        clinicId: string,
    ): CancelablePromise<v1GetClinicHeadResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/clinics/{clinicId}/head',
            path: {
                'clinicId': clinicId,
            },
        });
    }
    /**
     * @param departmentId
     * @param limit
     * @param offset
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1ListEmployeesByDepartmentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListEmployeesByDepartment(
        departmentId: string,
        limit?: number,
        offset?: number,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1ListEmployeesByDepartmentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/employees',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'limit': limit,
                'offset': offset,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
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
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceCountEmployeesByDepartment(
        departmentId: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1CountEmployeesByDepartmentResponse | rpcStatus> {
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
        });
    }
    /**
     * @param departmentId
     * @returns v1GetDepartmentResponsibleResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceGetDepartmentResponsible(
        departmentId: string,
    ): CancelablePromise<v1GetDepartmentResponsibleResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/departments/{departmentId}/responsible',
            path: {
                'departmentId': departmentId,
            },
        });
    }
    /**
     * @param employeeId
     * @param state Optional state filter. When empty, all states are returned.
     * Valid values: scheduled, active, ended, cancelled.
     * @param limit
     * @param offset
     * @returns v1ListVacationsByEmployeeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListVacationsByEmployee(
        employeeId: string,
        state?: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListVacationsByEmployeeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/employees/{employeeId}/vacations',
            path: {
                'employeeId': employeeId,
            },
            query: {
                'state': state,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param employeeId
     * @param state Optional state filter. When empty, counts all states.
     * Valid values: scheduled, active, ended, cancelled.
     * @returns v1CountVacationsByEmployeeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceCountVacationsByEmployee(
        employeeId: string,
        state?: string,
    ): CancelablePromise<v1CountVacationsByEmployeeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/employees/{employeeId}/vacations:count',
            path: {
                'employeeId': employeeId,
            },
            query: {
                'state': state,
            },
        });
    }
    /**
     * @param id
     * @returns v1GetEmployeeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceGetEmployee(
        id: string,
    ): CancelablePromise<v1GetEmployeeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/employees/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListOrgAdminsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListOrgAdmins(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListOrgAdminsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/admins',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListOrgDispatchersResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListOrgDispatchers(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListOrgDispatchersResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/dispatchers',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1ListEmployeesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListEmployeesByOrganization(
        organizationId: string,
        limit?: number,
        offset?: number,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1ListEmployeesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/employees',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'offset': offset,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
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
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceCountEmployeesByOrganization(
        organizationId: string,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1CountEmployeesByOrganizationResponse | rpcStatus> {
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
     * @param offset
     * @param includeTerminated When false (default), rows with terminated_at IS NOT NULL are
     * hidden. Set true to include offboarded employees.
     * @param onVacation When true, restrict to employees currently on an active vacation
     * (current_vacation_ends_at IS NOT NULL AND > now()).
     * @param position Optional exact-match filter on employee_cards.position. Trimmed
     * before comparison; all-whitespace is treated as unset.
     * @returns v1SearchEmployeesByOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceSearchEmployeesByOrganization(
        organizationId: string,
        query?: string,
        limit?: number,
        offset?: number,
        includeTerminated?: boolean,
        onVacation?: boolean,
        position?: string,
    ): CancelablePromise<v1SearchEmployeesByOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/employees:search',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'query': query,
                'limit': limit,
                'offset': offset,
                'includeTerminated': includeTerminated,
                'onVacation': onVacation,
                'position': position,
            },
        });
    }
    /**
     * @param organizationId
     * @param limit
     * @param offset
     * @returns v1ListOrgHeadsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListOrgHeads(
        organizationId: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListOrgHeadsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{organizationId}/heads',
            path: {
                'organizationId': organizationId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param limit
     * @param offset
     * @returns v1ListSystemAdminsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipQueryServiceListSystemAdmins(
        limit?: number,
        offset?: number,
    ): CancelablePromise<v1ListSystemAdminsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/system-admins',
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
}
