import type { IProduct, IProductFilters } from '@src/core/models';

export interface IProductService {
  getProducts(filters?: IProductFilters): Promise<IProduct[]>;
  getProductBySlug(slug: string): Promise<IProduct | null>;
  getProductById(id: string): Promise<IProduct | null>;
  getFlashSaleProducts(): Promise<IProduct[]>;
  getCategories(): Promise<string[]>;
  decrementStock(productId: string, quantity: number): Promise<boolean>;
  addProduct(product: IProduct): Promise<IProduct>;
  updateProduct(updated: IProduct): Promise<IProduct | null>;
  toggleProductEstado(productId: string): Promise<IProduct | null>;
  setFlashSale(productId: string, endsAt: string | null): Promise<IProduct | null>;
}
