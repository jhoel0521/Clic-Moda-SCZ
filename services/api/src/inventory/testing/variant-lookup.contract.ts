import type { VariantLookupPort } from '../application/ports/inventory.ports.js';
import { VariantId } from '../domain/value-objects/ids.vo.js';

export interface LookupWorld {
  port: VariantLookupPort;
  // Crea (o simula) una variante con el estado dado y devuelve su id.
  newVariant(active: boolean): Promise<VariantId>;
}
type Factory = () => Promise<LookupWorld> | LookupWorld;

// Suite de contrato: toda implementación del puerto (doble en memoria y SQL) debe pasarla.
export function variantLookupContract(label: string, make: Factory): void {
  describe(`VariantLookupPort: ${label}`, () => {
    it('una variante activa devuelve active true', async () => {
      const world = await make();
      const id = await world.newVariant(true);

      expect(await world.port.lookup(id)).toEqual({ active: true });
    });

    it('una variante inactiva devuelve active false', async () => {
      const world = await make();
      const id = await world.newVariant(false);

      expect(await world.port.lookup(id)).toEqual({ active: false });
    });

    it('una variante inexistente devuelve null', async () => {
      expect(await (await make()).port.lookup(VariantId.generate())).toBeNull();
    });
  });
}
