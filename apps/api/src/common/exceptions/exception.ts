import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export interface AppExceptionResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

function prepareResponse(statusCode: number, message: string, data?: unknown): AppExceptionResponse {
  const response: AppExceptionResponse = { statusCode, message };
  if (data !== undefined) {
    response.data = data;
  }
  return response;
}

export class AppException extends HttpException {
  protected constructor(statusCode: number, message: string, data?: unknown) {
    super(prepareResponse(statusCode, message, data), statusCode);
  }
}

export class AppBadRequestException extends AppException {
  constructor(message: string, data?: unknown) {
    super(HttpStatus.BAD_REQUEST, message, data);
  }

  static fromValidationErrors(errors: ValidationError[]): AppBadRequestException {
    const data: Record<string, Record<string, string>> = {};

    function flatten(errs: ValidationError[], prefix: string): void {
      for (const err of errs) {
        const key = prefix ? `${prefix}.${err.property}` : err.property;
        if (err.constraints) {
          data[key] = err.constraints;
        }
        if (err.children && err.children.length > 0) {
          flatten(err.children, key);
        }
      }
    }

    flatten(errors, '');
    return new AppBadRequestException('Validation failed', data);
  }
}

export class AppUnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class AppNotAllowedException extends AppException {
  constructor(message = 'Forbidden') {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class AppNotFoundException extends AppException {
  constructor(message = 'Not found') {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class AppNotRouteFoundError extends AppException {
  constructor(message = 'Route not found') {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class AppInternalServerError extends AppException {
  constructor(message = 'Internal Server Error') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

export class AppServiceUnavailableServerError extends AppException {
  constructor(message = 'Service unavailable') {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}
