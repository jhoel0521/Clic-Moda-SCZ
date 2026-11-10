import { categoriesRepositoryContract } from './categories-repository.contract.js';
import { InMemoryCategoriesRepository } from './in-memory-categories.repository.js';
import { InMemoryProductsRepository } from './in-memory-products.repository.js';
import { productsRepositoryContract } from './products-repository.contract.js';

categoriesRepositoryContract('fake en memoria', () => new InMemoryCategoriesRepository());

productsRepositoryContract('fake en memoria', () => ({
  categories: new InMemoryCategoriesRepository(),
  products: new InMemoryProductsRepository(),
}));
