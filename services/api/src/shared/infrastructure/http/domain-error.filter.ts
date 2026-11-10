import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from '../../domain/errors/domain.error.js';

type ErrorClass = abstract new (...args: never[]) => DomainError;

const STATUS_BY_ERROR: [ErrorClass, HttpStatus][] = [
  [ValidationError, HttpStatus.BAD_REQUEST],
  [UnauthenticatedError, HttpStatus.UNAUTHORIZED],
  [ForbiddenError, HttpStatus.FORBIDDEN],
  [NotFoundError, HttpStatus.NOT_FOUND],
  [ConflictError, HttpStatus.CONFLICT],
];

const statusFor = (error: DomainError): HttpStatus =>
  STATUS_BY_ERROR.find(([type]) => error instanceof type)?.[1] ?? HttpStatus.INTERNAL_SERVER_ERROR;

// Único lugar que traduce errores de dominio a HTTP.
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(error: DomainError, host: ArgumentsHost): void {
    const status = statusFor(error);
    const message = status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Error interno' : error.message;
    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      error: error.code,
      message,
    });
  }
}
