import { StockLevel } from '../domain/entities/stock-level.entity.js';
import { StockMovement } from '../domain/entities/stock-movement.entity.js';
import { CommandId, MovementId, VariantId } from '../domain/value-objects/ids.vo.js';
import {
  Location,
  Operator,
  Reason,
  ReorderLevel,
} from '../domain/value-objects/stock-values.vo.js';
import { InMemoryVariantLookup } from './fakes.js';
import { InMemoryStockQuery } from './in-memory-stock-query.js';
import { stockQueryContract, type QueryWorld, type VariantInfo } from './stock-query.contract.js';
import { variantLookupContract } from './variant-lookup.contract.js';
import { InMemoryStockCommandsRepository } from './in-memory-stock-commands.repository.js';
import { InMemoryStockLevelsRepository } from './in-memory-stock-levels.repository.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';
import { stockCommandsRepositoryContract } from './stock-commands-repository.contract.js';
import { InMemoryStockProcessing } from './in-memory-stock-processing.js';
import { stockCommandProcessingContract } from './stock-command-processing.contract.js';
import { stockLevelsRepositoryContract } from './stock-levels-repository.contract.js';

const newVariant = async (): Promise<VariantId> => VariantId.generate();

stockCommandsRepositoryContract('fake en memoria', () => ({
  commands: new InMemoryStockCommandsRepository(new InMemoryStockStore()),
  newVariant,
}));

stockLevelsRepositoryContract('fake en memoria', () => ({
  levels: new InMemoryStockLevelsRepository(new InMemoryStockStore()),
  newVariant,
}));

stockCommandProcessingContract('fake en memoria', () => {
  const store = new InMemoryStockStore();
  return {
    commands: new InMemoryStockCommandsRepository(store),
    levels: new InMemoryStockLevelsRepository(store),
    processing: new InMemoryStockProcessing(store),
    newVariant,
    movementsOf: async (variantId) =>
      store.movements.filter((movement) => movement.variantId.equals(variantId)),
  };
});

variantLookupContract('doble en memoria', () => {
  const port = new InMemoryVariantLookup();
  return {
    port,
    newVariant: async (active) => {
      const id = VariantId.generate();
      port.add(id, active);
      return id;
    },
  };
});

type Store = InMemoryStockStore;
type LevelInput = Parameters<QueryWorld['setLevel']>[1];
type MovementInput = Parameters<QueryWorld['addMovement']>[1];

const addVariant = (store: Store, info: VariantInfo): VariantId => {
  const id = VariantId.generate();
  store.variants.set(id.value, {
    sku: info.sku,
    productName: info.productName,
    size: info.size ?? '38',
    color: info.color ?? null,
    active: info.active ?? true,
  });
  return id;
};

const addLevel = (store: Store, variantId: VariantId, level: LevelInput): void => {
  store.levels.set(
    variantId.value,
    StockLevel.restore({
      variantId,
      onHand: level.onHand,
      reserved: level.reserved ?? 0,
      location: level.location ? Location.of(level.location) : null,
      reorderLevel: ReorderLevel.of(level.reorderLevel ?? 0),
    })
  );
};

const addMovement = (store: Store, variantId: VariantId, movement: MovementInput): void => {
  store.movements.push(
    StockMovement.restore({
      id: MovementId.generate(),
      variantId,
      commandId: CommandId.generate(),
      type: movement.type,
      delta: movement.delta,
      reason: Reason.of('Prueba de contrato'),
      operator: Operator.of('u-1'),
      occurredAt: movement.occurredAt,
    })
  );
};

stockQueryContract('fake en memoria', () => {
  const store = new InMemoryStockStore();
  return {
    query: new InMemoryStockQuery(store),
    newVariant: async (info) => addVariant(store, info),
    setLevel: async (variantId, level) => addLevel(store, variantId, level),
    addMovement: async (variantId, movement) => addMovement(store, variantId, movement),
  };
});
