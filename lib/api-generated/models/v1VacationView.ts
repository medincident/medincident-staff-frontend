/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * VacationView mirrors projections.employee_vacations. state is one of
 * {scheduled, active, ended, cancelled}.
 */
export type v1VacationView = {
    id?: string;
    employeeId?: string;
    state?: string;
    startsAt?: string;
    endsAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

