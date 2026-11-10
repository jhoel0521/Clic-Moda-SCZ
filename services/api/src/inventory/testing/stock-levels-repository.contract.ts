import type { StockLevelsRepository } from '../domain/stock-levels.repository.port.js';
import { VariantId } from '../domain/value-objects/ids.vo.js';
import { Location, ReorderLevel } from '../domain/value-objects/stock-values.vo.js';

export interface LevelsWorld {
  levels: StockLevelsRepository;
  // Crea (o simula) una variante existente sobre la que se puede guardar stock.
  newVariant(): Promise<VariantId>;
}
type Factory = () => Promise<LevelsWorld> | LevelsWorld;

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla.
export function stockLevelsRepositoryContract(label: string, make: Factory): void {
  describe(`StockLevelsRepository: ${label}`, () => {
    it('una variante sin fila devuelve null (equivale a stock cero)', async () => {
      const { levels } = await make();

      expect(await levels.findByVariantId(VariantId.generate())).toBeNull();
    });

    it('saveSettings crea la fila con cero unidades, ubicación y umbral', async () => {
      const { levels, newVariant } = await make();
      const variantId = await newVariant();
      await levels.saveSettings(variantId, Location.of('Estante A-2'), ReorderLevel.of(3));

      const found = await levels.findByVariantId(variantId);
      expect([found?.onHand, found?.reserved, found?.available]).toEqual([0, 0, 0]);
      expect([found?.location?.value, found?.reorderLevel.units]).toEqual(['Estante A-2', 3]);
    });

    it('saveSettings actualiza una fila existente y acepta quitar la ubicación', async () => {
      const { levels, newVariant } = await make();
      const variantId = await newVariant();
      await levels.saveSettings(variantId, Location.of('A-1'), ReorderLevel.of(1));
      const updated = await levels.saveSettings(variantId, null, ReorderLevel.of(9));

      expect([updated.location, updated.reorderLevel.units]).toEqual([null, 9]);
      expect((await levels.findByVariantId(variantId))?.reorderLevel.units).toBe(9);
    });
  });
}
