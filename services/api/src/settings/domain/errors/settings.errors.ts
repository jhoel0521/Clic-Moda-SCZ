import { ValidationError } from '../../../shared/domain/errors/domain.error.js';

// Un valor de configuración inválido: lleva el campo para que el Gerente vea qué corregir.
export class InvalidSettingError extends ValidationError {
  constructor(
    readonly field: string,
    message: string
  ) {
    super(message);
  }
}

// El color primario no cumple el contraste AA; ofrece el color cercano que sí lo cumple.
export class InsufficientContrastError extends InvalidSettingError {
  constructor(
    reasons: string[],
    readonly suggestion: string | null
  ) {
    const hint = suggestion ? `. Color cercano que sí cumple: ${suggestion}` : '';
    super('brandColor', `${reasons.join('. ')}${hint}`);
  }
}
