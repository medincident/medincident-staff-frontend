/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * PatientStatus is the simplified four-value status surfaced to patients.
 *
 * - PATIENT_STATUS_PENDING: buffer pending
 * - PATIENT_STATUS_ACCEPTED: dispatcher accepted; incident pending/in_progress
 * - PATIENT_STATUS_CLOSED: done / rejected / buffer rejected
 * - PATIENT_STATUS_CANCELLED: patient cancelled
 */
export enum v1PatientStatus {
    PATIENT_STATUS_UNSPECIFIED = 'PATIENT_STATUS_UNSPECIFIED',
    PATIENT_STATUS_PENDING = 'PATIENT_STATUS_PENDING',
    PATIENT_STATUS_ACCEPTED = 'PATIENT_STATUS_ACCEPTED',
    PATIENT_STATUS_CLOSED = 'PATIENT_STATUS_CLOSED',
    PATIENT_STATUS_CANCELLED = 'PATIENT_STATUS_CANCELLED',
}
