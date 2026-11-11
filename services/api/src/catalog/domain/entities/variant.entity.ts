import { VariantId } from '../value-objects/ids.vo.js';
import { Money } from '../value-objects/money.vo.js';
import { Color, Size, Sku } from '../value-objects/variant-attributes.vo.js';

export interface VariantProps {
  id: VariantId;
  sku: Sku;
  size: Size;
  color: Color | null;
  price: Money;
  active: boolean;
}

export const variantProps = (variant: Variant): VariantProps => ({
  id: variant.id,
  sku: variant.sku,
  size: variant.size,
  color: variant.color,
  price: variant.price,
  active: variant.active,
});

export interface VariantChanges {
  size?: Size;
  color?: Color | null;
  price?: Money;
}

// Unidad vendible de un producto. Solo se crea y modifica a través de `Product`, que protege las
// reglas entre variantes (SKU y combinación talla/color únicos).
export class Variant {
  private constructor(private props: VariantProps) {}

  static create(input: Omit<VariantProps, 'id' | 'active'>): Variant {
    return new Variant({ ...input, id: VariantId.generate(), active: true });
  }

  static restore(props: VariantProps): Variant {
    return new Variant({ ...props });
  }

  change(changes: VariantChanges): void {
    this.props = {
      ...this.props,
      size: changes.size ?? this.props.size,
      color: changes.color === undefined ? this.props.color : changes.color,
      price: changes.price ?? this.props.price,
    };
  }

  changeSku(sku: Sku): void {
    this.props = { ...this.props, sku };
  }

  setActive(active: boolean): void {
    this.props = { ...this.props, active };
  }

  get id(): VariantId {
    return this.props.id;
  }

  get sku(): Sku {
    return this.props.sku;
  }

  get size(): Size {
    return this.props.size;
  }

  get color(): Color | null {
    return this.props.color;
  }

  get price(): Money {
    return this.props.price;
  }

  get active(): boolean {
    return this.props.active;
  }
}
