/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddResponsibleRequest } from '../models/AddResponsibleRequest';
import type { AssignDepartmentEmployeeRequest } from '../models/AssignDepartmentEmployeeRequest';
import type { CreateDepartmentRequest } from '../models/CreateDepartmentRequest';
import type { Department } from '../models/Department';
import type { DepartmentEmployeeListResponse } from '../models/DepartmentEmployeeListResponse';
import type { DepartmentListResponse } from '../models/DepartmentListResponse';
import type { IneligibilityReasonCode } from '../models/IneligibilityReasonCode';
import type { ResponsibleCandidateListResponse } from '../models/ResponsibleCandidateListResponse';
import type { ResponsibleListResponse } from '../models/ResponsibleListResponse';
import type { UpdateDepartmentRequest } from '../models/UpdateDepartmentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DepartmentsService {
    /**
     * List of clinic departments
     * Requires administrator privileges.
     * Returns only active departments by default.
     * When includeDeactivated=true, deactivated departments are also returned.
     *
     * @param clinicId
     * @param includeDeactivated Whether to include deactivated entities in the result.
     * Default is false — only active entities are returned.
     *
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns DepartmentListResponse List of departments
     * @throws ApiError
     */
    public static listClinicDepartments(
        clinicId: string,
        includeDeactivated: boolean = false,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<DepartmentListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/clinics/{clinicId}/departments',
            path: {
                'clinicId': clinicId,
            },
            query: {
                'includeDeactivated': includeDeactivated,
                'q': q,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create department in clinic
     * Requires administrator privileges.
     * The department is always created within a specific clinic.
     *
     * @param clinicId
     * @param requestBody
     * @returns Department Resource created
     * @throws ApiError
     */
    public static createDepartment(
        clinicId: string,
        requestBody: CreateDepartmentRequest,
    ): CancelablePromise<Department> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/clinics/{clinicId}/departments',
            path: {
                'clinicId': clinicId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get department by ID
     * Requires administrator privileges.
     * Deactivated departments are considered deleted and return 404.
     *
     * @param departmentId
     * @returns Department Department
     * @throws ApiError
     */
    public static getDepartmentById(
        departmentId: string,
    ): CancelablePromise<Department> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/departments/{departmentId}',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update department
     * Requires administrator privileges.
     * Changing clinicId is forbidden: a department cannot be a parent of a department.
     *
     * @param departmentId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updateDepartment(
        departmentId: string,
        requestBody: UpdateDepartmentRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/departments/{departmentId}',
            path: {
                'departmentId': departmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete department
     * Requires administrator privileges.
     * Deletion is allowed only if the department has no assigned employees.
     *
     * @param departmentId
     * @returns void
     * @throws ApiError
     */
    public static deleteDepartment(
        departmentId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/departments/{departmentId}',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Deactivate department
     * Requires administrator privileges.
     * After department deactivation, new events cannot be created in this department.
     * Historical data is preserved: employees, events, assignments, and links are not deleted.
     *
     * @param departmentId
     * @returns void
     * @throws ApiError
     */
    public static deactivateDepartment(
        departmentId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/departments/{departmentId}/deactivate',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Reactivate department
     * Requires administrator privileges.
     * Returns the department to an active state.
     *
     * @param departmentId
     * @returns void
     * @throws ApiError
     */
    public static reactivateDepartment(
        departmentId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/departments/{departmentId}/reactivate',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get list of department employees
     * Requires administrator privileges.
     * Supports search by `q` and cursor pagination.
     *
     * @param departmentId
     * @param q Search string to filter results.
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns DepartmentEmployeeListResponse List of department employees
     * @throws ApiError
     */
    public static listDepartmentEmployees(
        departmentId: string,
        q?: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<DepartmentEmployeeListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/departments/{departmentId}/employees',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'q': q,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Assign user as department employee
     * Requires administrator privileges.
     * The user becomes an employee of the selected department,
     * which means they automatically belong to the parent clinic and organization.
     *
     * @param departmentId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static addDepartmentEmployee(
        departmentId: string,
        requestBody: AssignDepartmentEmployeeRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/departments/{departmentId}/employees',
            path: {
                'departmentId': departmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Resource state conflict`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Dismiss employee from department
     * Requires administrator privileges.
     * Removes the user from the employees of the specified department.
     *
     * @param departmentId
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static removeDepartmentEmployee(
        departmentId: string,
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/departments/{departmentId}/employees/{userId}',
            path: {
                'departmentId': departmentId,
                'userId': userId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get department responsibles
     * Requires administrator privileges.
     * Returns responsibles assigned directly to the department,
     * as well as clinic and organization responsibles (inherited from parent units).
     * Inherited responsibles from clinic and organization cannot be removed at the department level.
     *
     * @param departmentId
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleListResponse List of responsibles
     * @throws ApiError
     */
    public static listDepartmentResponsibles(
        departmentId: string,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/departments/{departmentId}/responsibles',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Add department responsible
     * Requires administrator privileges.
     * The user must belong to this specific department.
     *
     * @param departmentId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static addDepartmentResponsible(
        departmentId: string,
        requestBody: AddResponsibleRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/departments/{departmentId}/responsibles',
            path: {
                'departmentId': departmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Business rule violation`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get department responsible candidates
     * Requires administrator privileges.
     * Returns only suitable candidates by default.
     * When includeIneligible=true, ineligible candidates are also returned with reasons.
     * Deactivated users are not returned.
     *
     * @param departmentId
     * @param q Search string to filter results.
     * @param includeIneligible Whether to show ineligible candidates as well.
     * Does not affect deactivated users: they are not returned.
     *
     * @param ineligibilityReasonCodes Filter for ineligibility reasons of candidates.
     * Applied when includeIneligible=true.
     * If the user is not an employee, only the cause `not_an_employee` is returned.
     * For employees, reasons `different_organization`, `different_clinic`, `different_department` are used.
     *
     * @param cursor Cursor token to retrieve the next page.
     * @param limit
     * @returns ResponsibleCandidateListResponse List of department responsible candidates
     * @throws ApiError
     */
    public static listDepartmentResponsibleCandidates(
        departmentId: string,
        q?: string,
        includeIneligible: boolean = false,
        ineligibilityReasonCodes?: Array<IneligibilityReasonCode>,
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<ResponsibleCandidateListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/departments/{departmentId}/responsible-candidates',
            path: {
                'departmentId': departmentId,
            },
            query: {
                'q': q,
                'includeIneligible': includeIneligible,
                'ineligibilityReasonCodes': ineligibilityReasonCodes,
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Remove department responsible
     * Requires administrator privileges.
     * Removes a responsible assigned directly to the department.
     * Inherited responsibles from clinic and organization are removed at their respective levels.
     *
     * @param departmentId
     * @param responsibleUserId
     * @returns void
     * @throws ApiError
     */
    public static removeDepartmentResponsible(
        departmentId: string,
        responsibleUserId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/departments/{departmentId}/responsibles/{responsibleUserId}',
            path: {
                'departmentId': departmentId,
                'responsibleUserId': responsibleUserId,
            },
            errors: {
                401: `User unauthorized`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                500: `Internal Server Error`,
            },
        });
    }
}
