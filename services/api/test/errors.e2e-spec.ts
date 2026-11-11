import { Controller, Get, INestApplication, Param } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from '../src/shared/domain/errors/domain.error.js';
import { DomainErrorFilter } from '../src/shared/infrastructure/http/domain-error.filter.js';

const ERRORS: Record<string, DomainError> = {
  validation: new ValidationError('dato inválido'),
  unauthenticated: new UnauthenticatedError('sin sesión'),
  forbidden: new ForbiddenError('sin permiso'),
  notfound: new NotFoundError('no existe'),
  conflict: new ConflictError('duplicado'),
};

// Controlador de prueba: lanza el error de dominio que indica la URL, como lo haría un caso de uso.
@Controller('boom')
class ThrowingController {
  @Get(':kind')
  throwError(@Param('kind') kind: string): never {
    throw ERRORS[kind];
  }
}

describe('Errores de dominio a HTTP (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ThrowingController],
      providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['validation', 400, 'VALIDATION_ERROR'],
    ['unauthenticated', 401, 'UNAUTHENTICATED'],
    ['forbidden', 403, 'FORBIDDEN'],
    ['notfound', 404, 'NOT_FOUND'],
    ['conflict', 409, 'CONFLICT'],
  ])('un error %s del dominio responde HTTP %i con código %s', async (kind, status, code) => {
    const res = await request(app.getHttpServer()).get(`/boom/${kind}`).expect(status);

    expect(res.body).toMatchObject({ statusCode: status, error: code });
  });
});
