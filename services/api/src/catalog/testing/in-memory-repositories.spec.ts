import { categoriesRepositoryContract } from './categories-repository.contract.js';
import { InMemoryCategoriesRepository } from './in-memory-categories.repository.js';
import { InMemoryProductsRepository } from './in-memory-products.repository.js';
import { InMemoryVariantHasMovements } from './in-memory-variant-has-movements.js';
import { productsRepositoryContract } from './products-repository.contract.js';
import { variantHasMovementsContract } from './variant-has-movements.contract.js';
import { VariantId } from '../domain/value-objects/ids.vo.js';

categoriesRepositoryContract('fake en memoria', () => new InMemoryCategoriesRepository());

variantHasMovementsContract('doble en memoria', () => {
  const port = new InMemoryVariantHasMovements();
  return {
    port,
    newVariant: async ({ withMovement }) => {
      const id = VariantId.generate();
      if (withMovement) port.addMovement(id);
      return id;
    },
  };
});

productsRepositoryContract('fake en memoria', () => ({
  categories: new InMemoryCategoriesRepository(),
  products: new InMemoryProductsRepository(),
}));
