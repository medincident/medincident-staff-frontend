/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1IncidentSummary } from './v1IncidentSummary';
import type { v1PatientBufferSummary } from './v1PatientBufferSummary';
import type { v1RequestSummary } from './v1RequestSummary';
import type { v1SummaryPeriod } from './v1SummaryPeriod';
export type v1GetSummaryResponse = {
    incidents?: v1IncidentSummary;
    requests?: v1RequestSummary;
    patientBuffer?: v1PatientBufferSummary;
    period?: v1SummaryPeriod;
};

