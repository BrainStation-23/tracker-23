import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { APIError, APIException } from './api.exception';

export class ExceptionFormatter {
  /**
   * Get formatted error response from our internal APIException
   *
   * @static
   * @param {APIException} exception
   * @param {boolean} isProduction
   * @return {*}  {APIError}
   * @memberof ExceptionFormatter
   */
  static formatAPIException(
    exception: APIException,
    isProduction: boolean,
  ): APIError {
    return {
      message: exception.message,
      ...(exception.errors && { errors: exception.errors }),
      ...(!isProduction && { stack: exception.stack }),
    };
  }

  /**
   * Get formatted error response for validation error
   * Validation errors are normally thrown from the DTO
   *
   * @static
   * @param {BadRequestException} exception
   * @return {*}  {APIError}
   * @memberof ExceptionFormatter
   */
  static formatBadRequestException(exception: BadRequestException): APIError {
    const response = exception.getResponse() as {
      message: string;
      errors: string[];
    };

    // validation error
    if (response && response.errors && Array.isArray(response.errors)) {
      return {
        message: response.message,
        ...(response &&
          response.errors && {
            errors: response.errors.map((message: string) => ({ message })),
          }),
      };
    }

    // other bad request exception like invalid JSON input
    return {
      message: response.message,
    };
  }

  /**
   * Get formatted error response from not found exception
   * Normally this error is thrown by the nest, when an API endpoint is invalid
   *
   * @static
   * @param {NotFoundException} exception
   * @return {*}  {APIError}
   * @memberof ExceptionFormatter
   */
  static formatNotFoundException(exception: NotFoundException): APIError {
    const response = exception.getResponse() as {
      message: string;
    };

    return {
      message: response.message,
    };
  }

  /**
   * Format unauthorized error due to the permission
   *
   * @static
   * @param {UnauthorizedException} exception
   * @return {*}  {APIError}
   * @memberof ExceptionFormatter
   */
  static formatUnAuthorizedException(
    exception: UnauthorizedException,
  ): APIError {
    const response = exception.getResponse() as {
      error?: string;
      message: string;
    };

    return {
      message: response.message,
    };
  }

  /**
   * format and log unknown error those are not handled
   *
   * @static
   * @param {Error} exception
   * @param {boolean} isProduction
   * @return {*}  {APIError}
   * @memberof ExceptionFormatter
   */
  static formatUnknownError(exception: Error, isProduction: boolean): APIError {
    const error = {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      ...(!isProduction && exception.stack && { stack: exception.stack }),
    };

    return error;
  }
}
