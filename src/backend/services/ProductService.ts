import type { IProductService } from '@src/core/contracts/IProductService';
import type { IProduct, IProductFilters } from '@src/core/models';
import { findAll, findById, insert, update } from '../db/db';

export const ProductService: IProductService = {
  async getProducts(filters?: IProductFilters): Promise<IProduct[]> {
    let results = findAll('products');

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagNames.some((t) => t.toLowerCase().includes(q))
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
      results = results.filter((p) => filters.sizes!.some((size) => p.sizes.includes(size)));
    }

    if (filters?.colors?.length) {
      results = results.filter((p) => filters.colors!.some((color) => p.colors.includes(color)));
    }

    if (filters?.onlyFlashSale) {
      results = results.filter((p) => p.isFlashSale);
    }

    if (filters?.etiquetaIds?.length) {
      results = results.filter((p) =>
        filters.etiquetaIds!.some((id) => p.etiquetaIds.includes(id))
      );
    }

    return results;
  },

  async getProductBySlug(slug: string): Promise<IProduct | null> {
    const products = findAll('products');
    return products.find((p) => p.slug === slug) ?? null;
  },

  async getProductById(id: string): Promise<IProduct | null> {
    return findById<IProduct>('products', id);
  },

  async getFlashSaleProducts(): Promise<IProduct[]> {
    const products = findAll('products');
    const now = new Date();
    return products.filter(
      (p) => p.isFlashSale && p.flashSaleEndsAt && new Date(p.flashSaleEndsAt) > now
    );
  },

  async getCategories(): Promise<string[]> {
    const products = findAll('products');
    return [...new Set(products.map((p) => p.category))];
  },

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const product = findById<IProduct>('products', productId);
    if (!product || product.stock < quantity) return false;

    product.stock -= quantity;
    update('products', product);
    return true;
  },

  async addProduct(product: IProduct): Promise<IProduct> {
    return insert('products', product);
  },

  async updateProduct(updated: IProduct): Promise<IProduct | null> {
    return update('products', updated);
  },

  async toggleProductEstado(productId: string): Promise<IProduct | null> {
    const product = findById<IProduct>('products', productId);
    if (!product) return null;
    product.estado = product.estado === 'activo' ? 'inactivo' : 'activo';
    return update('products', product);
  },

  async setFlashSale(productId: string, endsAt: string | null): Promise<IProduct | null> {
    const product = findById<IProduct>('products', productId);
    if (!product) return null;
    product.isFlashSale = endsAt !== null;
    product.flashSaleEndsAt = endsAt ?? undefined;
    return update('products', product);
  },
};
