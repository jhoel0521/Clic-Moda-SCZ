import type { VariantHasMovementsPort } from '../application/ports/variant-has-movements.port.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';

// Doble en memoria del puerto: las pruebas marcan a mano qué variantes tienen movimientos.
export class InMemoryVariantHasMovements implements VariantHasMovementsPort {
  private readonly withMovements = new Set<string>();

  addMovement(id: VariantId): void {
    this.withMovements.add(id.value);
  }

  async hasMovements(id: VariantId): Promise<boolean> {
    return this.withMovements.has(id.value);
  }
}
