/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrgStructureCommandServiceCreateClinicBody } from '../models/OrgStructureCommandServiceCreateClinicBody';
import type { OrgStructureCommandServiceCreateDepartmentBody } from '../models/OrgStructureCommandServiceCreateDepartmentBody';
import type { OrgStructureCommandServiceUpdateClinicDetailsBody } from '../models/OrgStructureCommandServiceUpdateClinicDetailsBody';
import type { OrgStructureCommandServiceUpdateClinicPhysicalAddressBody } from '../models/OrgStructureCommandServiceUpdateClinicPhysicalAddressBody';
import type { OrgStructureCommandServiceUpdateDepartmentDetailsBody } from '../models/OrgStructureCommandServiceUpdateDepartmentDetailsBody';
import type { OrgStructureCommandServiceUpdateOrganizationDetailsBody } from '../models/OrgStructureCommandServiceUpdateOrganizationDetailsBody';
import type { OrgStructureCommandServiceUpdateOrganizationLegalAddressBody } from '../models/OrgStructureCommandServiceUpdateOrganizationLegalAddressBody';
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CreateClinicResponse } from '../models/v1CreateClinicResponse';
import type { v1CreateDepartmentResponse } from '../models/v1CreateDepartmentResponse';
import type { v1CreateOrganizationRequest } from '../models/v1CreateOrganizationRequest';
import type { v1CreateOrganizationResponse } from '../models/v1CreateOrganizationResponse';
import type { v1UpdateClinicDetailsResponse } from '../models/v1UpdateClinicDetailsResponse';
import type { v1UpdateClinicPhysicalAddressResponse } from '../models/v1UpdateClinicPhysicalAddressResponse';
import type { v1UpdateDepartmentDetailsResponse } from '../models/v1UpdateDepartmentDetailsResponse';
import type { v1UpdateOrganizationDetailsResponse } from '../models/v1UpdateOrganizationDetailsResponse';
import type { v1UpdateOrganizationLegalAddressResponse } from '../models/v1UpdateOrganizationLegalAddressResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrgStructureCommandServiceService {
    /**
     * @param clinicId
     * @param body
     * @returns v1CreateDepartmentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceCreateDepartment(
        clinicId: string,
        body: OrgStructureCommandServiceCreateDepartmentBody,
    ): CancelablePromise<v1CreateDepartmentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/clinics/{clinicId}/departments',
            path: {
                'clinicId': clinicId,
            },
            body: body,
        });
    }
    /**
     * @param clinicId
     * @param body
     * @returns v1UpdateClinicDetailsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceUpdateClinicDetails(
        clinicId: string,
        body: OrgStructureCommandServiceUpdateClinicDetailsBody,
    ): CancelablePromise<v1UpdateClinicDetailsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/clinics/{clinicId}/details',
            path: {
                'clinicId': clinicId,
            },
            body: body,
        });
    }
    /**
     * @param clinicId
     * @param body
     * @returns v1UpdateClinicPhysicalAddressResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceUpdateClinicPhysicalAddress(
        clinicId: string,
        body: OrgStructureCommandServiceUpdateClinicPhysicalAddressBody,
    ): CancelablePromise<v1UpdateClinicPhysicalAddressResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/clinics/{clinicId}/physical-address',
            path: {
                'clinicId': clinicId,
            },
            body: body,
        });
    }
    /**
     * @param departmentId
     * @param body
     * @returns v1UpdateDepartmentDetailsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceUpdateDepartmentDetails(
        departmentId: string,
        body: OrgStructureCommandServiceUpdateDepartmentDetailsBody,
    ): CancelablePromise<v1UpdateDepartmentDetailsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/departments/{departmentId}/details',
            path: {
                'departmentId': departmentId,
            },
            body: body,
        });
    }
    /**
     * @param body
     * @returns v1CreateOrganizationResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceCreateOrganization(
        body: v1CreateOrganizationRequest,
    ): CancelablePromise<v1CreateOrganizationResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations',
            body: body,
        });
    }
    /**
     * @param organizationId
     * @param body
     * @returns v1CreateClinicResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceCreateClinic(
        organizationId: string,
        body: OrgStructureCommandServiceCreateClinicBody,
    ): CancelablePromise<v1CreateClinicResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/clinics',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
    /**
     * @param organizationId
     * @param body
     * @returns v1UpdateOrganizationDetailsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceUpdateOrganizationDetails(
        organizationId: string,
        body: OrgStructureCommandServiceUpdateOrganizationDetailsBody,
    ): CancelablePromise<v1UpdateOrganizationDetailsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/organizations/{organizationId}/details',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
    /**
     * @param organizationId
     * @param body
     * @returns v1UpdateOrganizationLegalAddressResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static orgStructureCommandServiceUpdateOrganizationLegalAddress(
        organizationId: string,
        body: OrgStructureCommandServiceUpdateOrganizationLegalAddressBody,
    ): CancelablePromise<v1UpdateOrganizationLegalAddressResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/organizations/{organizationId}/legal-address',
            path: {
                'organizationId': organizationId,
            },
            body: body,
        });
    }
}
