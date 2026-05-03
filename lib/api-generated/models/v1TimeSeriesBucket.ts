/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1TimeSeriesIncidentBucket } from './v1TimeSeriesIncidentBucket';
import type { v1TimeSeriesRequestBucket } from './v1TimeSeriesRequestBucket';
export type v1TimeSeriesBucket = {
    bucketStart?: string;
    bucketEnd?: string;
    incidents?: v1TimeSeriesIncidentBucket;
    requests?: v1TimeSeriesRequestBucket;
};

