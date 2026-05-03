/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { queryRequestV1StatusHistoryEntry } from './queryRequestV1StatusHistoryEntry';
import type { v1ExecutorHistoryEntry } from './v1ExecutorHistoryEntry';
export type v1GetServiceRequestHistoryResponse = {
    statusHistory?: Array<queryRequestV1StatusHistoryEntry>;
    executorHistory?: Array<v1ExecutorHistoryEntry>;
};

