import { Product } from '../domain/entities/product.entity.js';
import { Variant, variantProps } from '../domain/entities/variant.entity.js';
import { DuplicateSkuError } from '../domain/errors/catalog.errors.js';
import type {
  ProductPage,
  ProductSearchFilter,
  ProductsRepository,
} from '../domain/products.repository.port.js';
import type { CategoryId, ProductId, VariantId } from '../domain/value-objects/ids.vo.js';
import type { Sku } from '../domain/value-objects/variant-attributes.vo.js';

const copy = (product: Product): Product =>
  Product.restore({
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    active: product.active,
    variants: product.variants.map((variant) => Variant.restore(variantProps(variant))),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  });

const matchesText = (product: Product, text: string): boolean => {
  const needle = text.trim().toLowerCase();
  return (
    product.name.value.toLowerCase().includes(needle) ||
    product.variants.some((variant) => variant.sku.value.toLowerCase().includes(needle))
  );
};

// Fake en memoria del puerto: lo usan las pruebas de aplicación. La prueba de contrato garantiza
// que se comporta igual que la implementación real con Postgres.
export class InMemoryProductsRepository implements ProductsRepository {
  private readonly store = new Map<string, Product>();
  private readonly stock = new Map<string, number>(); // disponible por variante (lo fija la prueba)

  setAvailable(id: VariantId, units: number): void {
    this.stock.set(id.value, units);
  }

  private availableOf(product: Product): number {
    return product.variants
      .filter((variant) => variant.active)
      .reduce((total, variant) => total + (this.stock.get(variant.id.value) ?? 0), 0);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const found = this.store.get(id.value);
    return found ? copy(found) : null;
  }

  async findByVariantId(id: VariantId): Promise<Product | null> {
    const found = this.all().find((p) => p.variants.some((variant) => variant.id.equals(id)));
    return found ? copy(found) : null;
  }

  async skuExists(sku: Sku): Promise<boolean> {
    return this.all().some((product) => product.variants.some((v) => v.sku.equals(sku)));
  }

  async search(filter: ProductSearchFilter): Promise<ProductPage> {
    const matching = this.all()
      .filter((p) => !filter.text || matchesText(p, filter.text))
      .filter((p) => !filter.categoryId || p.categoryId.equals(filter.categoryId))
      .filter((p) => filter.active === undefined || p.active === filter.active)
      .filter((p) => !filter.stock || this.availableOf(p) > 0 === (filter.stock === 'in'))
      .sort((a, b) => a.name.value.localeCompare(b.name.value));
    const start = (filter.page - 1) * filter.pageSize;
    return {
      items: matching.slice(start, start + filter.pageSize).map(copy),
      total: matching.length,
      available: Object.fromEntries(
        matching.slice(start, start + filter.pageSize).map((p) => [p.id.value, this.availableOf(p)])
      ),
    };
  }

  async countByCategory(categoryId: CategoryId): Promise<number> {
    return this.all().filter((product) => product.categoryId.equals(categoryId)).length;
  }

  // Atómico: primero se comprueba todo y solo después se guarda.
  async save(product: Product): Promise<void> {
    for (const variant of product.variants) {
      const taken = this.all().some(
        (other) =>
          !other.id.equals(product.id) && other.variants.some((v) => v.sku.equals(variant.sku))
      );
      if (taken) throw new DuplicateSkuError(variant.sku.value);
    }
    this.store.set(product.id.value, copy(product));
  }

  private all(): Product[] {
    return [...this.store.values()];
  }
}
