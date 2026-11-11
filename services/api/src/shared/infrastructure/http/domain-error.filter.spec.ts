import type { ArgumentsHost } from '@nestjs/common';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from '../../domain/errors/domain.error.js';
import { DomainErrorFilter } from './domain-error.filter.js';

type Captured = { status: number; body: Record<string, unknown> };

function respond(error: DomainError): Captured {
  const captured: Captured = { status: 0, body: {} };
  const response = {
    status(code: number) {
      captured.status = code;
      return response;
    },
    json(body: Record<string, unknown>) {
      captured.body = body;
      return response;
    },
  };
  const host = { switchToHttp: () => ({ getResponse: () => response }) };
  new DomainErrorFilter().catch(error, host as unknown as ArgumentsHost);
  return captured;
}

class Unmapped extends DomainError {
  readonly code = 'UNMAPPED';
}

describe('DomainErrorFilter', () => {
  it.each([
    [new ValidationError('dato inválido'), 400],
    [new UnauthenticatedError('credenciales'), 401],
    [new ForbiddenError('prohibido'), 403],
    [new NotFoundError('no existe'), 404],
    [new ConflictError('duplicado'), 409],
  ])('traduce %o a HTTP %i', (error, status) => {
    expect(respond(error).status).toBe(status);
  });

  it('devuelve código y mensaje del error de dominio', () => {
    expect(respond(new ConflictError('duplicado')).body).toEqual({
      statusCode: 409,
      error: 'CONFLICT',
      message: 'duplicado',
    });
  });

  it('un error de dominio sin traducción es 500 y no filtra su mensaje', () => {
    const { status, body } = respond(new Unmapped('detalle interno'));

    expect([status, body.message]).toEqual([500, 'Error interno']);
  });
});
