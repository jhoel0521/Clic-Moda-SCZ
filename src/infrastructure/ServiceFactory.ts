import { ProductApiService } from './api/ProductApiService';
import { OrderApiService } from './api/OrderApiService';
import { AuthApiService } from './api/AuthApiService';
import { CouponApiService } from './api/CouponApiService';
import { BannerApiService } from './api/BannerApiService';
import { ReviewApiService } from './api/ReviewApiService';

import type { IProductService } from '@src/core/contracts/IProductService';
import type { IOrderService } from '@src/core/contracts/IOrderService';
import type { IAuthService } from '@src/core/contracts/IAuthService';
import type { ICouponService } from '@src/core/contracts/ICouponService';
import type { IBannerService } from '@src/core/contracts/IBannerService';
import type { IReviewService } from '@src/core/contracts/IReviewService';

/**
 * SuperFactory para inyección de dependencias.
 * Decide qué implementación usar según el contexto (Cliente vs Servidor).
 */
export class ServiceFactory {
  static async getProductService(): Promise<IProductService> {
    if (typeof window === 'undefined') {
      const { ProductService } = await import('@src/backend/services/ProductService');
      return ProductService;
    }
    return ProductApiService;
  }

  static async getOrderService(): Promise<IOrderService> {
    if (typeof window === 'undefined') {
      const { OrderService } = await import('@src/backend/services/OrderService');
      return OrderService;
    }
    return OrderApiService;
  }

  static async getAuthService(): Promise<IAuthService> {
    if (typeof window === 'undefined') {
      const { AuthService } = await import('@src/backend/services/AuthService');
      return AuthService;
    }
    return AuthApiService;
  }

  static async getCouponService(): Promise<ICouponService> {
    if (typeof window === 'undefined') {
      const { CouponService } = await import('@src/backend/services/CouponService');
      return CouponService;
    }
    return CouponApiService;
  }

  static async getBannerService(): Promise<IBannerService> {
    if (typeof window === 'undefined') {
      const { BannerService } = await import('@src/backend/services/BannerService');
      return BannerService;
    }
    return BannerApiService;
  }

  static async getReviewService(): Promise<IReviewService> {
    if (typeof window === 'undefined') {
      const { ReviewService } = await import('@src/backend/services/ReviewService');
      return ReviewService;
    }
    return ReviewApiService;
  }
}
