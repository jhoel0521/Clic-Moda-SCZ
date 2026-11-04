import { ProductService } from '@src/backend/services/ProductService';
import { OrderService } from '@src/backend/services/OrderService';
import { AuthService } from '@src/backend/services/AuthService';
import { CouponService } from '@src/backend/services/CouponService';
import { BannerService } from '@src/backend/services/BannerService';
import { ReviewService } from '@src/backend/services/ReviewService';
import { EtiquetaService } from '@src/backend/services/EtiquetaService';

/**
 * DEMO sin servidor: todos los servicios corren en el navegador contra localStorage.
 * Para conectar un backend real basta con cambiar las implementaciones devueltas aquí.
 */
export class ServiceFactory {
  static async getProductService() {
    return ProductService;
  }
  static async getOrderService() {
    return OrderService;
  }
  static async getAuthService() {
    return AuthService;
  }
  static async getCouponService() {
    return CouponService;
  }
  static async getBannerService() {
    return BannerService;
  }
  static async getReviewService() {
    return ReviewService;
  }
  static async getEtiquetaService() {
    return EtiquetaService;
  }
}
