/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BusinessRuleViolationDetails } from './BusinessRuleViolationDetails';
import type { ConflictErrorDetails } from './ConflictErrorDetails';
import type { ForbiddenErrorDetails } from './ForbiddenErrorDetails';
import type { NotFoundErrorDetails } from './NotFoundErrorDetails';
import type { UnauthorizedErrorDetails } from './UnauthorizedErrorDetails';
import type { ValidationErrorDetails } from './ValidationErrorDetails';
export type ErrorDetails = (ValidationErrorDetails | UnauthorizedErrorDetails | ForbiddenErrorDetails | NotFoundErrorDetails | ConflictErrorDetails | BusinessRuleViolationDetails);

