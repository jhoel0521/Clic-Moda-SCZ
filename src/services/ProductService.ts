import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { IProductService } from '@src/core/contracts/IProductService';
import type { IProduct, IProductFilters } from '@src/core/models';

/**
 * Fachada de ProductService que delega la ejecución a la implementación
 * correcta inyectada por la SuperFactory.
 */
export const ProductService: IProductService = {
  async getProducts(filters?: IProductFilters) {
    const service = await ServiceFactory.getProductService();
    return service.getProducts(filters);
  },

  async getProductBySlug(slug: string) {
    const service = await ServiceFactory.getProductService();
    return service.getProductBySlug(slug);
  },

  async getProductById(id: string) {
    const service = await ServiceFactory.getProductService();
    return service.getProductById(id);
  },

  async getFlashSaleProducts() {
    const service = await ServiceFactory.getProductService();
    return service.getFlashSaleProducts();
  },

  async getCategories() {
    const service = await ServiceFactory.getProductService();
    return service.getCategories();
  },

  async decrementStock(productId: string, quantity: number) {
    const service = await ServiceFactory.getProductService();
    return service.decrementStock(productId, quantity);
  },

  async addProduct(product: IProduct) {
    const service = await ServiceFactory.getProductService();
    return service.addProduct(product);
  },

  async updateProduct(updated: IProduct) {
    const service = await ServiceFactory.getProductService();
    return service.updateProduct(updated);
  },

  async toggleProductEstado(productId: string) {
    const service = await ServiceFactory.getProductService();
    return service.toggleProductEstado(productId);
  },

  async setFlashSale(productId: string, endsAt: string | null) {
    const service = await ServiceFactory.getProductService();
    return service.setFlashSale(productId, endsAt);
  },
};
