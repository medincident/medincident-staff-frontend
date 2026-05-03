/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1SnapshotIncident } from './v1SnapshotIncident';
import type { v1SnapshotPatientBuffer } from './v1SnapshotPatientBuffer';
import type { v1SnapshotRequest } from './v1SnapshotRequest';
export type v1GetSnapshotResponse = {
    incidents?: Array<v1SnapshotIncident>;
    requests?: Array<v1SnapshotRequest>;
    patientBuffer?: Array<v1SnapshotPatientBuffer>;
};

