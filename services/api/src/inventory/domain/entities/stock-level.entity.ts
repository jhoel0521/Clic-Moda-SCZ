import { StockInvariantError } from '../errors/inventory.errors.js';
import type { VariantId } from '../value-objects/ids.vo.js';
import type { Location, ReorderLevel } from '../value-objects/stock-values.vo.js';

export interface StockLevelProps {
  variantId: VariantId;
  onHand: number;
  reserved: number;
  location: Location | null;
  reorderLevel: ReorderLevel;
}

// Stock de una variante. Disponible = físico − reservado. Las invariantes (nunca negativo, nunca más
// reservado que físico) se protegen aquí y, como última defensa, con CHECK en la base.
export class StockLevel {
  private constructor(private props: StockLevelProps) {}

  // Una variante sin fila de stock equivale a stock cero.
  static empty(variantId: VariantId, reorderLevel: ReorderLevel): StockLevel {
    return new StockLevel({ variantId, onHand: 0, reserved: 0, location: null, reorderLevel });
  }

  static restore(props: StockLevelProps): StockLevel {
    return new StockLevel({ ...props });
  }

  // Aplica un cambio de unidades físicas; lanza si rompería una invariante.
  applyDelta(delta: number): void {
    const onHand = this.props.onHand + delta;
    if (onHand < 0) throw new StockInvariantError('las unidades físicas serían negativas');
    if (onHand < this.props.reserved) {
      throw new StockInvariantError('quedarían menos unidades físicas que reservadas');
    }
    this.props = { ...this.props, onHand };
  }

  changeSettings(location: Location | null, reorderLevel: ReorderLevel): void {
    this.props = { ...this.props, location, reorderLevel };
  }

  get variantId(): VariantId {
    return this.props.variantId;
  }

  get onHand(): number {
    return this.props.onHand;
  }

  get reserved(): number {
    return this.props.reserved;
  }

  get available(): number {
    return this.props.onHand - this.props.reserved;
  }

  get location(): Location | null {
    return this.props.location;
  }

  get reorderLevel(): ReorderLevel {
    return this.props.reorderLevel;
  }

  // ¿El disponible está en el umbral de reposición o por debajo?
  get isLow(): boolean {
    return this.available <= this.props.reorderLevel.units;
  }
}
