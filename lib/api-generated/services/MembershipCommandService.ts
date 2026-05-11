/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MembershipCommandServiceAssignClinicHeadBody } from '../models/MembershipCommandServiceAssignClinicHeadBody';
import type { MembershipCommandServiceAssignClinicHeadDeputyBody } from '../models/MembershipCommandServiceAssignClinicHeadDeputyBody';
import type { MembershipCommandServiceAssignDepartmentResponsibleBody } from '../models/MembershipCommandServiceAssignDepartmentResponsibleBody';
import type { MembershipCommandServiceAssignDepartmentResponsibleDeputyBody } from '../models/MembershipCommandServiceAssignDepartmentResponsibleDeputyBody';
import type { MembershipCommandServiceAssignOrganizationAdminBody } from '../models/MembershipCommandServiceAssignOrganizationAdminBody';
import type { MembershipCommandServiceAssignOrganizationAdminDeputyBody } from '../models/MembershipCommandServiceAssignOrganizationAdminDeputyBody';
import type { MembershipCommandServiceAssignOrganizationDispatcherBody } from '../models/MembershipCommandServiceAssignOrganizationDispatcherBody';
import type { MembershipCommandServiceAssignOrganizationDispatcherDeputyBody } from '../models/MembershipCommandServiceAssignOrganizationDispatcherDeputyBody';
import type { MembershipCommandServiceAssignOrganizationHeadBody } from '../models/MembershipCommandServiceAssignOrganizationHeadBody';
import type { MembershipCommandServiceAssignOrganizationHeadDeputyBody } from '../models/MembershipCommandServiceAssignOrganizationHeadDeputyBody';
import type { MembershipCommandServiceScheduleVacationBody } from '../models/MembershipCommandServiceScheduleVacationBody';
import type { MembershipCommandServiceStartVacationNowBody } from '../models/MembershipCommandServiceStartVacationNowBody';
import type { MembershipCommandServiceUpdateEmployeeDepartmentBody } from '../models/MembershipCommandServiceUpdateEmployeeDepartmentBody';
import type { MembershipCommandServiceUpdateEmployeePositionBody } from '../models/MembershipCommandServiceUpdateEmployeePositionBody';
import type { MembershipCommandServiceUpdateVacationEndDateBody } from '../models/MembershipCommandServiceUpdateVacationEndDateBody';
import type { v1AssignClinicHeadDeputyResponse } from '../models/v1AssignClinicHeadDeputyResponse';
import type { v1AssignClinicHeadResponse } from '../models/v1AssignClinicHeadResponse';
import type { v1AssignDepartmentResponsibleDeputyResponse } from '../models/v1AssignDepartmentResponsibleDeputyResponse';
import type { v1AssignDepartmentResponsibleResponse } from '../models/v1AssignDepartmentResponsibleResponse';
import type { v1AssignOrganizationAdminDeputyResponse } from '../models/v1AssignOrganizationAdminDeputyResponse';
import type { v1AssignOrganizationAdminResponse } from '../models/v1AssignOrganizationAdminResponse';
import type { v1AssignOrganizationDispatcherDeputyResponse } from '../models/v1AssignOrganizationDispatcherDeputyResponse';
import type { v1AssignOrganizationDispatcherResponse } from '../models/v1AssignOrganizationDispatcherResponse';
import type { v1AssignOrganizationHeadDeputyResponse } from '../models/v1AssignOrganizationHeadDeputyResponse';
import type { v1AssignOrganizationHeadResponse } from '../models/v1AssignOrganizationHeadResponse';
import type { v1CancelScheduledVacationResponse } from '../models/v1CancelScheduledVacationResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1ForceEndVacationResponse } from '../models/v1ForceEndVacationResponse';
import type { v1GrantSystemAdminRequest } from '../models/v1GrantSystemAdminRequest';
import type { v1GrantSystemAdminResponse } from '../models/v1GrantSystemAdminResponse';
import type { v1HireEmployeeRequest } from '../models/v1HireEmployeeRequest';
import type { v1HireEmployeeResponse } from '../models/v1HireEmployeeResponse';
import type { v1RemoveClinicHeadDeputyResponse } from '../models/v1RemoveClinicHeadDeputyResponse';
import type { v1RemoveDepartmentResponsibleDeputyResponse } from '../models/v1RemoveDepartmentResponsibleDeputyResponse';
import type { v1RemoveOrganizationAdminDeputyResponse } from '../models/v1RemoveOrganizationAdminDeputyResponse';
import type { v1RemoveOrganizationDispatcherDeputyResponse } from '../models/v1RemoveOrganizationDispatcherDeputyResponse';
import type { v1RemoveOrganizationHeadDeputyResponse } from '../models/v1RemoveOrganizationHeadDeputyResponse';
import type { v1RevokeClinicHeadResponse } from '../models/v1RevokeClinicHeadResponse';
import type { v1RevokeDepartmentResponsibleResponse } from '../models/v1RevokeDepartmentResponsibleResponse';
import type { v1RevokeOrganizationAdminResponse } from '../models/v1RevokeOrganizationAdminResponse';
import type { v1RevokeOrganizationDispatcherResponse } from '../models/v1RevokeOrganizationDispatcherResponse';
import type { v1RevokeOrganizationHeadResponse } from '../models/v1RevokeOrganizationHeadResponse';
import type { v1RevokeSystemAdminResponse } from '../models/v1RevokeSystemAdminResponse';
import type { v1ScheduleVacationResponse } from '../models/v1ScheduleVacationResponse';
import type { v1StartVacationNowResponse } from '../models/v1StartVacationNowResponse';
import type { v1TerminateEmployeeResponse } from '../models/v1TerminateEmployeeResponse';
import type { v1UpdateEmployeeDepartmentResponse } from '../models/v1UpdateEmployeeDepartmentResponse';
import type { v1UpdateEmployeePositionResponse } from '../models/v1UpdateEmployeePositionResponse';
import type { v1UpdateVacationEndDateResponse } from '../models/v1UpdateVacationEndDateResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MembershipCommandService {
    /**
     * ------ ClinicHead ------
     * @param clinicId
     * @param body
     * @returns v1AssignClinicHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignClinicHead(
        clinicId: string,
        body: MembershipCommandServiceAssignClinicHeadBody,
    ): CancelablePromise<v1AssignClinicHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/heads',
            path: {
                'clinicId': clinicId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_not_found\` — clinic with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`clinic_head_already_assigned\` — this clinic already has a head assigned.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param employeeId
     * @returns v1RevokeClinicHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRevokeClinicHead(
        clinicId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeClinicHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/clinics/{clinicId}/heads/{employeeId}',
            path: {
                'clinicId': clinicId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_head_not_found\` — this employee is not the clinic head.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param employeeId
     * @returns v1RemoveClinicHeadDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRemoveClinicHeadDeputy(
        clinicId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveClinicHeadDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/clinics/{clinicId}/heads/{employeeId}/deputy',
            path: {
                'clinicId': clinicId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_not_found\` — clinic with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param clinicId
     * @param employeeId
     * @param body
     * @returns v1AssignClinicHeadDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignClinicHeadDeputy(
        clinicId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignClinicHeadDeputyBody,
    ): CancelablePromise<v1AssignClinicHeadDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/heads/{employeeId}/deputy',
            path: {
                'clinicId': clinicId,
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`clinic_not_found\` — clinic with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.
                - \`deputy_not_found\` — deputy employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`deputy_already_assigned\` — this employee is already a deputy for this role.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * ------ DepartmentResponsible ------
     * @param departmentId
     * @param body
     * @returns v1AssignDepartmentResponsibleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignDepartmentResponsible(
        departmentId: string,
        body: MembershipCommandServiceAssignDepartmentResponsibleBody,
    ): CancelablePromise<v1AssignDepartmentResponsibleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/departments/{departmentId}/responsibles',
            path: {
                'departmentId': departmentId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_not_found\` — department with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`department_responsible_already_assigned\` — this employee is already the department responsible.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param employeeId
     * @returns v1RevokeDepartmentResponsibleResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRevokeDepartmentResponsible(
        departmentId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeDepartmentResponsibleResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/departments/{departmentId}/responsibles/{employeeId}',
            path: {
                'departmentId': departmentId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_responsible_not_found\` — this employee is not the department responsible.
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param employeeId
     * @returns v1RemoveDepartmentResponsibleDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRemoveDepartmentResponsibleDeputy(
        departmentId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveDepartmentResponsibleDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/departments/{departmentId}/responsibles/{employeeId}/deputy',
            path: {
                'departmentId': departmentId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param departmentId
     * @param employeeId
     * @param body
     * @returns v1AssignDepartmentResponsibleDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignDepartmentResponsibleDeputy(
        departmentId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignDepartmentResponsibleDeputyBody,
    ): CancelablePromise<v1AssignDepartmentResponsibleDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/departments/{departmentId}/responsibles/{employeeId}/deputy',
            path: {
                'departmentId': departmentId,
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`department_not_found\` — department with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.
                - \`deputy_not_found\` — deputy employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`deputy_already_assigned\` — this employee is already a deputy for this role.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * Employee lifecycle
     * @param body
     * @returns v1HireEmployeeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandHireEmployee(
        body: v1HireEmployeeRequest,
    ): CancelablePromise<v1HireEmployeeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/employees',
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`zitadel_user_not_found\` — Zitadel user with the given ID does not exist.
                - \`department_not_found\` — department with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`employee_already_hired\` — this Zitadel user is already an active employee of this organization.`,
                500: `Unexpected server error.`,
                503: `Service unavailable. Error codes:
                - \`zitadel_verify_failed\` — Zitadel identity service is temporarily unavailable.`,
            },
        });
    }
    /**
     * @param employeeId
     * @returns v1TerminateEmployeeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandTerminateEmployee(
        employeeId: string,
    ): CancelablePromise<v1TerminateEmployeeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/employees/{employeeId}',
            path: {
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param employeeId
     * @param body
     * @returns v1UpdateEmployeeDepartmentResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandUpdateEmployeeDepartment(
        employeeId: string,
        body: MembershipCommandServiceUpdateEmployeeDepartmentBody,
    ): CancelablePromise<v1UpdateEmployeeDepartmentResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/employees/{employeeId}/department',
            path: {
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`employee_not_found\` — employee with the given ID does not exist.
                - \`department_not_found\` — department with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param employeeId
     * @param body
     * @returns v1UpdateEmployeePositionResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandUpdateEmployeePosition(
        employeeId: string,
        body: MembershipCommandServiceUpdateEmployeePositionBody,
    ): CancelablePromise<v1UpdateEmployeePositionResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/employees/{employeeId}/position',
            path: {
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param employeeId
     * @param body
     * @returns v1ScheduleVacationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandScheduleVacation(
        employeeId: string,
        body: MembershipCommandServiceScheduleVacationBody,
    ): CancelablePromise<v1ScheduleVacationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/employees/{employeeId}/vacations',
            path: {
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * Vacation lifecycle
     * @param employeeId
     * @param body
     * @returns v1StartVacationNowResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandStartVacationNow(
        employeeId: string,
        body: MembershipCommandServiceStartVacationNowBody,
    ): CancelablePromise<v1StartVacationNowResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/employees/{employeeId}/vacations:start-now',
            path: {
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * ------ OrganizationAdmin ------
     * @param organizationId
     * @param body
     * @returns v1AssignOrganizationAdminResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignOrganizationAdmin(
        organizationId: string,
        body: MembershipCommandServiceAssignOrganizationAdminBody,
    ): CancelablePromise<v1AssignOrganizationAdminResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/admins',
            path: {
                'organizationId': organizationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`organization_admin_already_assigned\` — this employee is already an organization admin.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RevokeOrganizationAdminResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRevokeOrganizationAdmin(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeOrganizationAdminResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/admins/{employeeId}',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_admin_not_found\` — this employee is not an organization admin.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RemoveOrganizationAdminDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRemoveOrganizationAdminDeputy(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveOrganizationAdminDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/admins/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @param body
     * @returns v1AssignOrganizationAdminDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignOrganizationAdminDeputy(
        organizationId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignOrganizationAdminDeputyBody,
    ): CancelablePromise<v1AssignOrganizationAdminDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/admins/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.
                - \`deputy_not_found\` — deputy employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`deputy_already_assigned\` — this employee is already a deputy for this role.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * ------ OrganizationDispatcher ------
     * @param organizationId
     * @param body
     * @returns v1AssignOrganizationDispatcherResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignOrganizationDispatcher(
        organizationId: string,
        body: MembershipCommandServiceAssignOrganizationDispatcherBody,
    ): CancelablePromise<v1AssignOrganizationDispatcherResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/dispatchers',
            path: {
                'organizationId': organizationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`organization_dispatcher_already_assigned\` — this employee is already an organization dispatcher.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RevokeOrganizationDispatcherResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRevokeOrganizationDispatcher(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeOrganizationDispatcherResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/dispatchers/{employeeId}',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_dispatcher_not_found\` — this employee is not an organization dispatcher.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RemoveOrganizationDispatcherDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRemoveOrganizationDispatcherDeputy(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveOrganizationDispatcherDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/dispatchers/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @param body
     * @returns v1AssignOrganizationDispatcherDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignOrganizationDispatcherDeputy(
        organizationId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignOrganizationDispatcherDeputyBody,
    ): CancelablePromise<v1AssignOrganizationDispatcherDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/dispatchers/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.
                - \`deputy_not_found\` — deputy employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`deputy_already_assigned\` — this employee is already a deputy for this role.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * ------ OrganizationHead ------
     * @param organizationId
     * @param body
     * @returns v1AssignOrganizationHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignOrganizationHead(
        organizationId: string,
        body: MembershipCommandServiceAssignOrganizationHeadBody,
    ): CancelablePromise<v1AssignOrganizationHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/heads',
            path: {
                'organizationId': organizationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`organization_head_already_assigned\` — this organization already has a head assigned.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RevokeOrganizationHeadResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRevokeOrganizationHead(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeOrganizationHeadResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/heads/{employeeId}',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_head_not_found\` — this employee is not the organization head.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RemoveOrganizationHeadDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRemoveOrganizationHeadDeputy(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveOrganizationHeadDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/heads/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @param body
     * @returns v1AssignOrganizationHeadDeputyResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandAssignOrganizationHeadDeputy(
        organizationId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignOrganizationHeadDeputyBody,
    ): CancelablePromise<v1AssignOrganizationHeadDeputyResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/heads/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`organization_not_found\` — organization with the given ID does not exist.
                - \`employee_not_found\` — employee with the given ID does not exist.
                - \`deputy_not_found\` — deputy employee with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`deputy_already_assigned\` — this employee is already a deputy for this role.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * ------ SystemAdmin ------
     * @param body
     * @returns v1GrantSystemAdminResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandGrantSystemAdmin(
        body: v1GrantSystemAdminRequest,
    ): CancelablePromise<v1GrantSystemAdminResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/system-admins',
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`zitadel_user_not_found\` — Zitadel user with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`system_admin_already_granted\` — this user is already a system admin.`,
                500: `Unexpected server error.`,
                503: `Service unavailable. Error codes:
                - \`zitadel_verify_failed\` — Zitadel identity service is temporarily unavailable.`,
            },
        });
    }
    /**
     * @param zitadelUserId
     * @returns v1RevokeSystemAdminResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandRevokeSystemAdmin(
        zitadelUserId: string,
    ): CancelablePromise<v1RevokeSystemAdminResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/system-admins/{zitadelUserId}',
            path: {
                'zitadelUserId': zitadelUserId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`system_admin_not_found\` — this user is not a system admin.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param vacationId
     * @returns v1CancelScheduledVacationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandCancelScheduledVacation(
        vacationId: string,
    ): CancelablePromise<v1CancelScheduledVacationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/vacations/{vacationId}/cancellations',
            path: {
                'vacationId': vacationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`vacation_not_found\` — vacation with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param vacationId
     * @param body
     * @returns v1UpdateVacationEndDateResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandUpdateVacationEndDate(
        vacationId: string,
        body: MembershipCommandServiceUpdateVacationEndDateBody,
    ): CancelablePromise<v1UpdateVacationEndDateResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/vacations/{vacationId}/end-date',
            path: {
                'vacationId': vacationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`vacation_not_found\` — vacation with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param vacationId
     * @returns v1ForceEndVacationResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandForceEndVacation(
        vacationId: string,
    ): CancelablePromise<v1ForceEndVacationResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/vacations/{vacationId}/terminations',
            path: {
                'vacationId': vacationId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`vacation_not_found\` — vacation with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
