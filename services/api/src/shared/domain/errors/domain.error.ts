// Errores de negocio. Ninguna capa conoce códigos HTTP: el filtro de infraestructura los traduce.
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
}

export class UnauthenticatedError extends DomainError {
  readonly code = 'UNAUTHENTICATED';
}
