import type { IProductService } from '@src/core/contracts/IProductService';
import type { IProduct, IProductFilters } from '@src/core/models';
import { apiFetch } from '@src/services/api';

export const ProductApiService: IProductService = {
  async getProducts(filters?: IProductFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.onlyFlashSale) params.append('onlyFlashSale', 'true');
    filters?.sizes?.forEach((s) => params.append('sizes', s));
    filters?.colors?.forEach((c) => params.append('colors', c));
    filters?.etiquetaIds?.forEach((id) => params.append('etiquetaIds', id));

    return apiFetch<IProduct[]>(`/api/products?${params.toString()}`);
  },

  async getProductBySlug(slug: string) {
    const products = await apiFetch<IProduct[]>(`/api/products?slug=${slug}`);
    return products.find((p) => p.slug === slug) ?? null;
  },

  async getProductById(id: string) {
    return apiFetch<IProduct>(`/api/products/${id}`);
  },

  async getFlashSaleProducts() {
    return apiFetch<IProduct[]>('/api/products?onlyFlashSale=true');
  },

  async getCategories() {
    const products = await apiFetch<IProduct[]>('/api/products');
    return [...new Set(products.map((p) => p.category))];
  },

  async decrementStock(productId: string, quantity: number) {
    const res = await apiFetch<{ success: boolean }>(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ decrement: quantity }),
    });
    return res.success;
  },

  async addProduct(product: IProduct) {
    return apiFetch<IProduct>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(updated: IProduct) {
    return apiFetch<IProduct>(`/api/products/${updated.id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
  },

  async toggleProductEstado(productId: string) {
    return apiFetch<IProduct>(`/api/products/${productId}`, {
      method: 'PATCH',
    });
  },

  async setFlashSale(productId: string, endsAt: string | null) {
    return apiFetch<IProduct>(`/api/products/${productId}/flash-sale`, {
      method: 'PUT',
      body: JSON.stringify({ endsAt }),
    });
  },
};
