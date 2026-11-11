import { UuidValueObject } from '../../../shared/domain/uuid-value-object.js';
import { InvalidCatalogIdError } from '../errors/invalid-value.errors.js';

export class CategoryId extends UuidValueObject {
  static generate(): CategoryId {
    return new CategoryId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): CategoryId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidCatalogIdError('categoría', raw);
    return new CategoryId({ value });
  }
}

export class ProductId extends UuidValueObject {
  static generate(): ProductId {
    return new ProductId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): ProductId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidCatalogIdError('producto', raw);
    return new ProductId({ value });
  }
}

export class VariantId extends UuidValueObject {
  static generate(): VariantId {
    return new VariantId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): VariantId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidCatalogIdError('variante', raw);
    return new VariantId({ value });
  }
}
