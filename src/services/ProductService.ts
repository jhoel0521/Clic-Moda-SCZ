import type { IProductService } from '@src/core/contracts/IProductService';
import { apiFetch } from './api';

export const ProductService: IProductService = {
  async getProducts(filters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.onlyFlashSale) params.append('onlyFlashSale', 'true');
    filters?.sizes?.forEach((s) => params.append('sizes', s));
    filters?.colors?.forEach((c) => params.append('colors', c));

    return apiFetch(`/api/products?${params.toString()}`);
  },

  async getProductBySlug(slug) {
    const products = await apiFetch<any[]>(`/api/products?slug=${slug}`);
    return products.find((p) => p.slug === slug) ?? null;
  },

  async getProductById(id) {
    return apiFetch(`/api/products/${id}`);
  },

  async getFlashSaleProducts() {
    return apiFetch('/api/products?onlyFlashSale=true');
  },

  async getCategories() {
    const products = await apiFetch<any[]>('/api/products');
    return [...new Set(products.map((p) => p.category))];
  },

  async decrementStock(productId, quantity) {
    const res = await apiFetch<any>(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ decrement: quantity }),
    });
    return res.success;
  },

  async addProduct(product) {
    return apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(updated) {
    return apiFetch(`/api/products/${updated.id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
  },

  async toggleProductEstado(productId) {
    return apiFetch(`/api/products/${productId}`, {
      method: 'PATCH',
    });
  },

  async setFlashSale(productId, endsAt) {
    return apiFetch(`/api/products/${productId}/flash-sale`, {
      method: 'PUT',
      body: JSON.stringify({ endsAt }),
    });
  },
};
