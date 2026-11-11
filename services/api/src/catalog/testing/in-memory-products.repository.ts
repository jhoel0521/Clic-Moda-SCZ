import { Product } from '../domain/entities/product.entity.js';
import { Variant, variantProps } from '../domain/entities/variant.entity.js';
import { DuplicateSkuError } from '../domain/errors/catalog.errors.js';
import type {
  ProductPage,
  ProductSearchFilter,
  ProductsRepository,
} from '../domain/products.repository.port.js';
import type { CategoryId, ProductId, VariantId } from '../domain/value-objects/ids.vo.js';
import type { Slug } from '../domain/value-objects/names.vo.js';
import type { Sku } from '../domain/value-objects/variant-attributes.vo.js';

const copy = (product: Product): Product =>
  Product.restore({
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
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

  private soldOutOf(product: Product): number {
    return product.variants.filter((v) => v.active && (this.stock.get(v.id.value) ?? 0) <= 0)
      .length;
  }

  private matchesStock(product: Product, stock: 'out' | 'in' | 'partial'): boolean {
    if (stock === 'partial') return this.soldOutOf(product) > 0;
    return this.availableOf(product) > 0 === (stock === 'in');
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

  async findBySlug(slug: Slug): Promise<Product | null> {
    const found = this.all().find((product) => product.slug.equals(slug));
    return found ? copy(found) : null;
  }

  async slugExists(slug: Slug): Promise<boolean> {
    return this.all().some((product) => product.slug.equals(slug));
  }

  async skuExists(sku: Sku): Promise<boolean> {
    return this.all().some((product) => product.variants.some((v) => v.sku.equals(sku)));
  }

  async search(filter: ProductSearchFilter): Promise<ProductPage> {
    const matching = this.all()
      .filter((p) => !filter.text || matchesText(p, filter.text))
      .filter((p) => !filter.categoryId || p.categoryId.equals(filter.categoryId))
      .filter((p) => filter.active === undefined || p.active === filter.active)
      .filter((p) => !filter.stock || this.matchesStock(p, filter.stock))
      .sort((a, b) => a.name.value.localeCompare(b.name.value));
    const start = (filter.page - 1) * filter.pageSize;
    return {
      items: matching.slice(start, start + filter.pageSize).map(copy),
      total: matching.length,
      available: Object.fromEntries(
        matching.slice(start, start + filter.pageSize).map((p) => [p.id.value, this.availableOf(p)])
      ),
      variantStock: this.variantStockOf(matching.slice(start, start + filter.pageSize)),
      soldOutVariants: Object.fromEntries(
        matching.slice(start, start + filter.pageSize).map((p) => [p.id.value, this.soldOutOf(p)])
      ),
    };
  }

  private variantStockOf(products: Product[]): ProductPage['variantStock'] {
    const stock = (id: string) => ({
      available: this.stock.get(id) ?? 0,
      location: null,
      reorderLevel: 0,
    });
    return Object.fromEntries(
      products.flatMap((p) => p.variants).map((v) => [v.id.value, stock(v.id.value)])
    );
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
