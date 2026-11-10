import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from './domain.error.js';

describe('Errores de dominio', () => {
  it.each([
    [ValidationError, 'VALIDATION_ERROR'],
    [NotFoundError, 'NOT_FOUND'],
    [ConflictError, 'CONFLICT'],
    [ForbiddenError, 'FORBIDDEN'],
    [UnauthenticatedError, 'UNAUTHENTICATED'],
  ])('%o expone su código estable %s', (type, code) => {
    expect(new type('x').code).toBe(code);
  });

  it('conserva el mensaje y el nombre de la clase', () => {
    const error = new NotFoundError('no existe');

    expect([error.message, error.name]).toEqual(['no existe', 'NotFoundError']);
  });

  it('es un Error y un DomainError', () => {
    const error = new NotFoundError('no existe');

    expect([error instanceof Error, error instanceof DomainError]).toEqual([true, true]);
  });
});
