import { delay } from '@src/mocks/utils/delay';
import productsData from '@src/mocks/data/products.json';
import type { IProduct, IProductFilters } from '@src/core/models';

// Base de datos en memoria
const mockProductsDB: IProduct[] = productsData as unknown as IProduct[];

export const MockProductService = {
  /**
   * Retorna todos los productos, con filtros opcionales.
   */
  async getProducts(filters?: IProductFilters): Promise<IProduct[]> {
    await delay();

    let results = [...mockProductsDB];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      );
    }

    if (filters?.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters?.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters?.sizes?.length) {
      results = results.filter((p) =>
        filters.sizes!.some((size) => p.sizes.includes(size)),
      );
    }

    if (filters?.colors?.length) {
      results = results.filter((p) =>
        filters.colors!.some((color) => p.colors.includes(color)),
      );
    }

    if (filters?.onlyFlashSale) {
      results = results.filter((p) => p.isFlashSale);
    }

    return results;
  },

  /**
   * Obtiene un producto por su slug.
   */
  async getProductBySlug(slug: string): Promise<IProduct | null> {
    await delay();
    return mockProductsDB.find((p) => p.slug === slug) ?? null;
  },

  /**
   * Obtiene un producto por su ID.
   */
  async getProductById(id: string): Promise<IProduct | null> {
    await delay();
    return mockProductsDB.find((p) => p.id === id) ?? null;
  },

  /**
   * Retorna los productos en oferta flash activa.
   */
  async getFlashSaleProducts(): Promise<IProduct[]> {
    await delay();
    const now = new Date();
    return mockProductsDB.filter(
      (p) =>
        p.isFlashSale &&
        p.flashSaleEndsAt &&
        new Date(p.flashSaleEndsAt) > now,
    );
  },

  /**
   * Retorna las categorías únicas disponibles.
   */
  async getCategories(): Promise<string[]> {
    await delay(100, 300);
    return [...new Set(mockProductsDB.map((p) => p.category))];
  },

  /**
   * Decrementa el stock de un producto (llamado al confirmar pedido).
   */
  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    await delay(100, 200);
    const product = mockProductsDB.find((p) => p.id === productId);
    if (!product || product.stock < quantity) return false;
    product.stock -= quantity;
    return true;
  },
};
