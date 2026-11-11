import type { CategoriesRepository } from '../domain/categories.repository.port.js';
import { Category } from '../domain/entities/category.entity.js';
import { DuplicateCategoryError } from '../domain/errors/catalog.errors.js';
import type { CategoryId } from '../domain/value-objects/ids.vo.js';
import type { CategoryName } from '../domain/value-objects/names.vo.js';

const copy = (category: Category): Category =>
  Category.restore({
    id: category.id,
    name: category.name,
    slug: category.slug,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  });

// Fake en memoria del puerto: lo usan las pruebas de aplicación. La prueba de contrato garantiza
// que se comporta igual que la implementación real con Postgres.
export class InMemoryCategoriesRepository implements CategoriesRepository {
  private readonly store = new Map<string, Category>();

  async findById(id: CategoryId): Promise<Category | null> {
    const found = this.store.get(id.value);
    return found ? copy(found) : null;
  }

  async findByName(name: CategoryName): Promise<Category | null> {
    const found = this.all().find((category) => sameName(category, name.value));
    return found ? copy(found) : null;
  }

  async list(): Promise<Category[]> {
    return this.all()
      .sort((a, b) => a.name.value.localeCompare(b.name.value))
      .map(copy);
  }

  async save(category: Category): Promise<void> {
    const clash = this.all().find(
      (other) =>
        !other.id.equals(category.id) &&
        (sameName(other, category.name.value) || other.slug.equals(category.slug))
    );
    if (clash) throw new DuplicateCategoryError(category.name.value);
    this.store.set(category.id.value, copy(category));
  }

  async delete(id: CategoryId): Promise<void> {
    this.store.delete(id.value);
  }

  private all(): Category[] {
    return [...this.store.values()];
  }
}

const sameName = (category: Category, name: string): boolean =>
  category.name.value.toLowerCase() === name.toLowerCase();
