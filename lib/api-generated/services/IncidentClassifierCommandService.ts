/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncidentClassifierCommandServiceCreateIncidentCategoryBody } from '../models/IncidentClassifierCommandServiceCreateIncidentCategoryBody';
import type { IncidentClassifierCommandServiceCreateIncidentTypeBody } from '../models/IncidentClassifierCommandServiceCreateIncidentTypeBody';
import type { IncidentClassifierCommandServiceMoveIncidentCategoryBody } from '../models/IncidentClassifierCommandServiceMoveIncidentCategoryBody';
import type { IncidentClassifierCommandServiceMoveIncidentTypeBody } from '../models/IncidentClassifierCommandServiceMoveIncidentTypeBody';
import type { IncidentClassifierCommandServiceUpdateIncidentCategoryDetailsBody } from '../models/IncidentClassifierCommandServiceUpdateIncidentCategoryDetailsBody';
import type { IncidentClassifierCommandServiceUpdateIncidentTypeDetailsBody } from '../models/IncidentClassifierCommandServiceUpdateIncidentTypeDetailsBody';
import type { v1AllowIncidentTypeForPatientsResponse } from '../models/v1AllowIncidentTypeForPatientsResponse';
import type { v1CreateIncidentCategoryResponse } from '../models/v1CreateIncidentCategoryResponse';
import type { v1CreateIncidentTypeResponse } from '../models/v1CreateIncidentTypeResponse';
import type { v1DeactivateIncidentCategoryResponse } from '../models/v1DeactivateIncidentCategoryResponse';
import type { v1DeactivateIncidentTypeResponse } from '../models/v1DeactivateIncidentTypeResponse';
import type { v1DeleteIncidentCategoryResponse } from '../models/v1DeleteIncidentCategoryResponse';
import type { v1DeleteIncidentTypeResponse } from '../models/v1DeleteIncidentTypeResponse';
import type { v1DisallowIncidentTypeForPatientsResponse } from '../models/v1DisallowIncidentTypeForPatientsResponse';
import type { v1ErrorResponse } from '../models/v1ErrorResponse';
import type { v1MoveIncidentCategoryResponse } from '../models/v1MoveIncidentCategoryResponse';
import type { v1MoveIncidentTypeResponse } from '../models/v1MoveIncidentTypeResponse';
import type { v1ReactivateIncidentCategoryResponse } from '../models/v1ReactivateIncidentCategoryResponse';
import type { v1ReactivateIncidentTypeResponse } from '../models/v1ReactivateIncidentTypeResponse';
import type { v1UpdateIncidentCategoryDetailsResponse } from '../models/v1UpdateIncidentCategoryDetailsResponse';
import type { v1UpdateIncidentTypeDetailsResponse } from '../models/v1UpdateIncidentTypeDetailsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IncidentClassifierCommandService {
    /**
     * @param categoryId
     * @returns v1DeleteIncidentCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandDeleteIncidentCategory(
        categoryId: string,
    ): CancelablePromise<v1DeleteIncidentCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/incident-categories/{categoryId}',
            path: {
                'categoryId': categoryId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param categoryId
     * @returns v1DeactivateIncidentCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandDeactivateIncidentCategory(
        categoryId: string,
    ): CancelablePromise<v1DeactivateIncidentCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}/deactivations',
            path: {
                'categoryId': categoryId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param categoryId
     * @param body
     * @returns v1UpdateIncidentCategoryDetailsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandUpdateIncidentCategoryDetails(
        categoryId: string,
        body: IncidentClassifierCommandServiceUpdateIncidentCategoryDetailsBody,
    ): CancelablePromise<v1UpdateIncidentCategoryDetailsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incident-categories/{categoryId}/details',
            path: {
                'categoryId': categoryId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`incident_category_name_conflict\` — a category with this name already exists in the same scope.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param categoryId
     * @returns v1ReactivateIncidentCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandReactivateIncidentCategory(
        categoryId: string,
    ): CancelablePromise<v1ReactivateIncidentCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}/reactivations',
            path: {
                'categoryId': categoryId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`incident_category_reactivate_name_conflict\` — reactivation would create a name conflict with an active category.`,
                422: `Failed precondition. Error codes:
                - \`incident_category_reactivate_inactive_ancestor\` — an ancestor category is inactive and must be reactivated first.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * --- Types ---
     * @param categoryId
     * @param body
     * @returns v1CreateIncidentTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandCreateIncidentType(
        categoryId: string,
        body: IncidentClassifierCommandServiceCreateIncidentTypeBody,
    ): CancelablePromise<v1CreateIncidentTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}/types',
            path: {
                'categoryId': categoryId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`incident_type_name_conflict\` — a type with this name already exists in the same category.`,
                422: `Failed precondition. Error codes:
                - \`incident_category_inactive\` — the category is inactive; new types cannot be created in an inactive category.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param categoryId
     * @param body
     * @returns v1MoveIncidentCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandMoveIncidentCategory(
        categoryId: string,
        body: IncidentClassifierCommandServiceMoveIncidentCategoryBody,
    ): CancelablePromise<v1MoveIncidentCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-categories/{categoryId}:move',
            path: {
                'categoryId': categoryId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_not_found\` — category with the given ID does not exist.
                - \`incident_category_parent_not_found\` — target parent category with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_category_move_organization_mismatch\` — target parent belongs to a different organization.
                - \`incident_category_move_would_create_cycle\` — move would create a cycle in the category tree.
                - \`incident_category_move_would_exceed_depth\` — move would exceed the maximum category depth.
                - \`incident_category_parent_inactive\` — target parent category is inactive.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DeleteIncidentTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandDeleteIncidentType(
        typeId: string,
    ): CancelablePromise<v1DeleteIncidentTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/incident-types/{typeId}',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DeactivateIncidentTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandDeactivateIncidentType(
        typeId: string,
    ): CancelablePromise<v1DeactivateIncidentTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}/deactivations',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @param body
     * @returns v1UpdateIncidentTypeDetailsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandUpdateIncidentTypeDetails(
        typeId: string,
        body: IncidentClassifierCommandServiceUpdateIncidentTypeDetailsBody,
    ): CancelablePromise<v1UpdateIncidentTypeDetailsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/incident-types/{typeId}/details',
            path: {
                'typeId': typeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`incident_type_name_conflict\` — a type with this name already exists in the same category.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1DisallowIncidentTypeForPatientsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandDisallowIncidentTypeForPatients(
        typeId: string,
    ): CancelablePromise<v1DisallowIncidentTypeForPatientsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/incident-types/{typeId}/patient-allowances',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1AllowIncidentTypeForPatientsResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandAllowIncidentTypeForPatients(
        typeId: string,
    ): CancelablePromise<v1AllowIncidentTypeForPatientsResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}/patient-allowances',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @returns v1ReactivateIncidentTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandReactivateIncidentType(
        typeId: string,
    ): CancelablePromise<v1ReactivateIncidentTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}/reactivations',
            path: {
                'typeId': typeId,
            },
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`incident_type_reactivate_name_conflict\` — reactivation would create a name conflict with an active type.`,
                422: `Failed precondition. Error codes:
                - \`incident_type_reactivate_inactive_ancestor\` — the parent category is inactive and must be reactivated first.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * @param typeId
     * @param body
     * @returns v1MoveIncidentTypeResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandMoveIncidentType(
        typeId: string,
        body: IncidentClassifierCommandServiceMoveIncidentTypeBody,
    ): CancelablePromise<v1MoveIncidentTypeResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/incident-types/{typeId}:move',
            path: {
                'typeId': typeId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_type_not_found\` — type with the given ID does not exist.
                - \`incident_type_category_not_found\` — target category with the given ID does not exist.`,
                422: `Failed precondition. Error codes:
                - \`incident_type_move_organization_mismatch\` — target category belongs to a different organization.
                - \`incident_type_category_inactive\` — target category is inactive.
                - \`incident_category_inactive\` — target category is inactive.`,
                500: `Unexpected server error.`,
            },
        });
    }
    /**
     * --- Categories ---
     * @param organizationId
     * @param body
     * @returns v1CreateIncidentCategoryResponse A successful response.
     * @returns v1ErrorResponse An unexpected error response.
     * @throws ApiError
     */
    public static incidentClassifierCommandCreateIncidentCategory(
        organizationId: string,
        body: IncidentClassifierCommandServiceCreateIncidentCategoryBody,
    ): CancelablePromise<v1CreateIncidentCategoryResponse | v1ErrorResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{organizationId}/incident-categories',
            path: {
                'organizationId': organizationId,
            },
            body: body,
            errors: {
                400: `Validation failed or invalid input.`,
                401: `Unauthenticated — missing or invalid token.`,
                403: `Permission denied.`,
                404: `Not found. Error codes:
                - \`incident_category_parent_not_found\` — parent category with the given ID does not exist.`,
                409: `Conflict. Error codes:
                - \`incident_category_name_conflict\` — a category with this name already exists in the same scope.`,
                422: `Failed precondition. Error codes:
                - \`incident_category_parent_inactive\` — parent category is inactive.
                - \`incident_category_parent_organization_mismatch\` — parent category belongs to a different organization.
                - \`incident_category_max_depth_exceeded\` — category tree depth limit (5) would be exceeded.`,
                500: `Unexpected server error.`,
            },
        });
    }
}
