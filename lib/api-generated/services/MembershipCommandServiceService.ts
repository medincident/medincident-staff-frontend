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
import type { rpcStatus } from '../models/rpcStatus';
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
export class MembershipCommandServiceService {
    /**
     * ------ ClinicHead ------
     * @param clinicId
     * @param body
     * @returns v1AssignClinicHeadResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignClinicHead(
        clinicId: string,
        body: MembershipCommandServiceAssignClinicHeadBody,
    ): CancelablePromise<v1AssignClinicHeadResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/heads',
            path: {
                'clinicId': clinicId,
            },
            body: body,
        });
    }
    /**
     * @param clinicId
     * @param employeeId
     * @returns v1RevokeClinicHeadResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRevokeClinicHead(
        clinicId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeClinicHeadResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/clinics/{clinicId}/heads/{employeeId}',
            path: {
                'clinicId': clinicId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param clinicId
     * @param employeeId
     * @returns v1RemoveClinicHeadDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRemoveClinicHeadDeputy(
        clinicId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveClinicHeadDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/clinics/{clinicId}/heads/{employeeId}/deputy',
            path: {
                'clinicId': clinicId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param clinicId
     * @param employeeId
     * @param body
     * @returns v1AssignClinicHeadDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignClinicHeadDeputy(
        clinicId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignClinicHeadDeputyBody,
    ): CancelablePromise<v1AssignClinicHeadDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/heads/{employeeId}/deputy',
            path: {
                'clinicId': clinicId,
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * ------ DepartmentResponsible ------
     * @param departmentId
     * @param body
     * @returns v1AssignDepartmentResponsibleResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignDepartmentResponsible(
        departmentId: string,
        body: MembershipCommandServiceAssignDepartmentResponsibleBody,
    ): CancelablePromise<v1AssignDepartmentResponsibleResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/departments/{departmentId}/responsibles',
            path: {
                'departmentId': departmentId,
            },
            body: body,
        });
    }
    /**
     * @param departmentId
     * @param employeeId
     * @returns v1RevokeDepartmentResponsibleResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRevokeDepartmentResponsible(
        departmentId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeDepartmentResponsibleResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/departments/{departmentId}/responsibles/{employeeId}',
            path: {
                'departmentId': departmentId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param departmentId
     * @param employeeId
     * @returns v1RemoveDepartmentResponsibleDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRemoveDepartmentResponsibleDeputy(
        departmentId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveDepartmentResponsibleDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/departments/{departmentId}/responsibles/{employeeId}/deputy',
            path: {
                'departmentId': departmentId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param departmentId
     * @param employeeId
     * @param body
     * @returns v1AssignDepartmentResponsibleDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignDepartmentResponsibleDeputy(
        departmentId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignDepartmentResponsibleDeputyBody,
    ): CancelablePromise<v1AssignDepartmentResponsibleDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/departments/{departmentId}/responsibles/{employeeId}/deputy',
            path: {
                'departmentId': departmentId,
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * Employee lifecycle
     * @param body
     * @returns v1HireEmployeeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceHireEmployee(
        body: v1HireEmployeeRequest,
    ): CancelablePromise<v1HireEmployeeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/employees',
            body: body,
        });
    }
    /**
     * @param employeeId
     * @returns v1TerminateEmployeeResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceTerminateEmployee(
        employeeId: string,
    ): CancelablePromise<v1TerminateEmployeeResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/employees/{employeeId}',
            path: {
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param employeeId
     * @param body
     * @returns v1UpdateEmployeeDepartmentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceUpdateEmployeeDepartment(
        employeeId: string,
        body: MembershipCommandServiceUpdateEmployeeDepartmentBody,
    ): CancelablePromise<v1UpdateEmployeeDepartmentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/employees/{employeeId}/department',
            path: {
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * @param employeeId
     * @param body
     * @returns v1UpdateEmployeePositionResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceUpdateEmployeePosition(
        employeeId: string,
        body: MembershipCommandServiceUpdateEmployeePositionBody,
    ): CancelablePromise<v1UpdateEmployeePositionResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/employees/{employeeId}/position',
            path: {
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * @param employeeId
     * @param body
     * @returns v1ScheduleVacationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceScheduleVacation(
        employeeId: string,
        body: MembershipCommandServiceScheduleVacationBody,
    ): CancelablePromise<v1ScheduleVacationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/employees/{employeeId}/vacations',
            path: {
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * Vacation lifecycle
     * @param employeeId
     * @param body
     * @returns v1StartVacationNowResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceStartVacationNow(
        employeeId: string,
        body: MembershipCommandServiceStartVacationNowBody,
    ): CancelablePromise<v1StartVacationNowResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/employees/{employeeId}/vacations:start-now',
            path: {
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * ------ OrganizationAdmin ------
     * @param organizationId
     * @param body
     * @returns v1AssignOrganizationAdminResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignOrganizationAdmin(
        organizationId: string,
        body: MembershipCommandServiceAssignOrganizationAdminBody,
    ): CancelablePromise<v1AssignOrganizationAdminResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/admins',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RevokeOrganizationAdminResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRevokeOrganizationAdmin(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeOrganizationAdminResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/admins/{employeeId}',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RemoveOrganizationAdminDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRemoveOrganizationAdminDeputy(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveOrganizationAdminDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/admins/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @param body
     * @returns v1AssignOrganizationAdminDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignOrganizationAdminDeputy(
        organizationId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignOrganizationAdminDeputyBody,
    ): CancelablePromise<v1AssignOrganizationAdminDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/admins/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * ------ OrganizationDispatcher ------
     * @param organizationId
     * @param body
     * @returns v1AssignOrganizationDispatcherResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignOrganizationDispatcher(
        organizationId: string,
        body: MembershipCommandServiceAssignOrganizationDispatcherBody,
    ): CancelablePromise<v1AssignOrganizationDispatcherResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/dispatchers',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RevokeOrganizationDispatcherResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRevokeOrganizationDispatcher(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeOrganizationDispatcherResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/dispatchers/{employeeId}',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RemoveOrganizationDispatcherDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRemoveOrganizationDispatcherDeputy(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveOrganizationDispatcherDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/dispatchers/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @param body
     * @returns v1AssignOrganizationDispatcherDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignOrganizationDispatcherDeputy(
        organizationId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignOrganizationDispatcherDeputyBody,
    ): CancelablePromise<v1AssignOrganizationDispatcherDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/dispatchers/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * ------ OrganizationHead ------
     * @param organizationId
     * @param body
     * @returns v1AssignOrganizationHeadResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignOrganizationHead(
        organizationId: string,
        body: MembershipCommandServiceAssignOrganizationHeadBody,
    ): CancelablePromise<v1AssignOrganizationHeadResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/heads',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RevokeOrganizationHeadResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRevokeOrganizationHead(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RevokeOrganizationHeadResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/heads/{employeeId}',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @returns v1RemoveOrganizationHeadDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRemoveOrganizationHeadDeputy(
        organizationId: string,
        employeeId: string,
    ): CancelablePromise<v1RemoveOrganizationHeadDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{organizationId}/heads/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
        });
    }
    /**
     * @param organizationId
     * @param employeeId
     * @param body
     * @returns v1AssignOrganizationHeadDeputyResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceAssignOrganizationHeadDeputy(
        organizationId: string,
        employeeId: string,
        body: MembershipCommandServiceAssignOrganizationHeadDeputyBody,
    ): CancelablePromise<v1AssignOrganizationHeadDeputyResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/heads/{employeeId}/deputy',
            path: {
                'organizationId': organizationId,
                'employeeId': employeeId,
            },
            body: body,
        });
    }
    /**
     * ------ SystemAdmin ------
     * @param body
     * @returns v1GrantSystemAdminResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceGrantSystemAdmin(
        body: v1GrantSystemAdminRequest,
    ): CancelablePromise<v1GrantSystemAdminResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/system-admins',
            body: body,
        });
    }
    /**
     * @param zitadelUserId
     * @returns v1RevokeSystemAdminResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceRevokeSystemAdmin(
        zitadelUserId: string,
    ): CancelablePromise<v1RevokeSystemAdminResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/system-admins/{zitadelUserId}',
            path: {
                'zitadelUserId': zitadelUserId,
            },
        });
    }
    /**
     * @param vacationId
     * @returns v1CancelScheduledVacationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceCancelScheduledVacation(
        vacationId: string,
    ): CancelablePromise<v1CancelScheduledVacationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/vacations/{vacationId}/cancellations',
            path: {
                'vacationId': vacationId,
            },
        });
    }
    /**
     * @param vacationId
     * @param body
     * @returns v1UpdateVacationEndDateResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceUpdateVacationEndDate(
        vacationId: string,
        body: MembershipCommandServiceUpdateVacationEndDateBody,
    ): CancelablePromise<v1UpdateVacationEndDateResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/vacations/{vacationId}/end-date',
            path: {
                'vacationId': vacationId,
            },
            body: body,
        });
    }
    /**
     * @param vacationId
     * @returns v1ForceEndVacationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static membershipCommandServiceForceEndVacation(
        vacationId: string,
    ): CancelablePromise<v1ForceEndVacationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/vacations/{vacationId}/terminations',
            path: {
                'vacationId': vacationId,
            },
        });
    }
}
