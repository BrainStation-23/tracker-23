import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { APIException, APIError } from './api.exception';
import { Response } from 'express';
import { ExceptionFormatter } from './exception-formatter';
import { coreConfig } from 'config/core';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  private isProduction: boolean = coreConfig.env === 'PRODUCTION';

  catch(exception: T, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse<Response>();
    let error: APIError = {
      message: 'Something went wrong',
    };
    let status: HttpStatus = HttpStatus.OK;

    if (exception instanceof APIException) {
      // application specific errors
      error = ExceptionFormatter.formatAPIException(
        exception,
        this.isProduction,
      );
      status = exception.httpStatus;
    } else if (exception instanceof BadRequestException) {
      // validation error
      error = ExceptionFormatter.formatBadRequestException(exception);
      status = exception.getStatus();
    } else if (exception instanceof UnauthorizedException) {
      error = ExceptionFormatter.formatUnAuthorizedException(exception);
      status = exception.getStatus();
    } else if (exception instanceof NotFoundException) {
      error = ExceptionFormatter.formatNotFoundException(exception);
      status = exception.getStatus();
    } else if (exception instanceof ForbiddenException) {
      error = ExceptionFormatter.formatUnAuthorizedException(exception);
      status = exception.getStatus();
    } else if (exception instanceof Error) {
      // unknown internal error
      error = ExceptionFormatter.formatUnknownError(
        exception,
        this.isProduction,
      );
    }
    res.status(status || HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
}
