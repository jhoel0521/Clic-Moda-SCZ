import type { VariantHasMovementsPort } from '../application/ports/variant-has-movements.port.js';
import { VariantId } from '../domain/value-objects/ids.vo.js';

export interface MovementsWorld {
  port: VariantHasMovementsPort;
  // Crea una variante real (con su producto) y devuelve su id; `withMovement` añade un movimiento.
  newVariant(options: { withMovement: boolean }): Promise<VariantId>;
}
type Factory = () => Promise<MovementsWorld> | MovementsWorld;

// Suite de contrato: toda implementación del puerto (doble en memoria y SQL) debe pasarla.
export function variantHasMovementsContract(label: string, make: Factory): void {
  describe(`VariantHasMovementsPort: ${label}`, () => {
    it('una variante sin movimientos devuelve false', async () => {
      const world = await make();
      const id = await world.newVariant({ withMovement: false });

      expect(await world.port.hasMovements(id)).toBe(false);
    });

    it('una variante con movimientos devuelve true', async () => {
      const world = await make();
      const id = await world.newVariant({ withMovement: true });

      expect(await world.port.hasMovements(id)).toBe(true);
    });

    it('una variante inexistente devuelve false', async () => {
      expect(await (await make()).port.hasMovements(VariantId.generate())).toBe(false);
    });
  });
}
