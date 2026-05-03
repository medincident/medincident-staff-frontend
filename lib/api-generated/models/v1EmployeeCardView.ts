/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * EmployeeCardView is the denormalised card projection returned by
 * both Get and List endpoints. Fields mirror projections.employee_cards
 * columns; timestamps are RFC3339 strings. Optional fields stay unset
 * when the backing column is NULL.
 */
export type v1EmployeeCardView = {
    employeeId?: string;
    zitadelUserId?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
    organizationId?: string;
    organizationName?: string;
    clinicId?: string;
    clinicName?: string;
    departmentId?: string;
    departmentName?: string;
    position?: string;
    terminatedAt?: string;
    currentVacationEndsAt?: string;
    nextVacationStartsAt?: string;
};

