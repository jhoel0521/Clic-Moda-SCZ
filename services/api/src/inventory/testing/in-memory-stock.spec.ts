import { VariantId } from '../domain/value-objects/ids.vo.js';
import { InMemoryStockCommandsRepository } from './in-memory-stock-commands.repository.js';
import { InMemoryStockLevelsRepository } from './in-memory-stock-levels.repository.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';
import { stockCommandsRepositoryContract } from './stock-commands-repository.contract.js';
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
