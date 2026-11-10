import { UuidValueObject } from '../../../shared/domain/uuid-value-object.js';
import { InvalidInventoryIdError } from '../errors/inventory.errors.js';

// `inventory` se refiere a una variante solo por su id: no importa código del contexto `catalog`.
export class VariantId extends UuidValueObject {
  static generate(): VariantId {
    return new VariantId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): VariantId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidInventoryIdError('variante', raw);
    return new VariantId({ value });
  }
}

export class CommandId extends UuidValueObject {
  static generate(): CommandId {
    return new CommandId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): CommandId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidInventoryIdError('comando', raw);
    return new CommandId({ value });
  }
}

export class MovementId extends UuidValueObject {
  static generate(): MovementId {
    return new MovementId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): MovementId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidInventoryIdError('movimiento', raw);
    return new MovementId({ value });
  }
}
