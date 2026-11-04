import { uid } from '@src/shared/utils/uid';
import type { IOrderService } from '@src/core/contracts/IOrderService';
import type {
  ICuponDescuento,
  IOrder,
  IOrderItem,
  ICreateOrderInput,
  IProduct,
  OrderStatus,
} from '@src/core/models';
import { ORDER_STATUS } from '@src/core/constants/ORDER_STATUS';
import { findAll, findById, insert, update } from '../db/db';
import { ProductService, availableStock } from './ProductService';
import { CouponService } from './CouponService';

function generateTicketId(): string {
  return `TICK-${uid(6).toUpperCase()}`;
}

export const OrderService: IOrderService = {
  async createOrder(input: ICreateOrderInput): Promise<IOrder> {
    // Precios y stock salen del catálogo; primero se valida todo y luego se descuenta.
    const priced = input.items.map((item) => {
      const product = findById<IProduct>('products', item.productId);
      const stock = product ? availableStock(product, item.selectedSize, item.selectedColor) : 0;
      if (!product || item.quantity <= 0 || stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${item.name}, talla ${item.selectedSize} (${item.selectedColor})`
        );
      }
      return { ...item, price: product.price };
    });

    for (const item of priced) {
      await ProductService.decrementStock(
        item.productId,
        item.quantity,
        item.selectedSize,
        item.selectedColor
      );
    }

    const subtotal = priced.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const coupon = input.couponCode
      ? await CouponService.applyCoupon(input.couponCode, subtotal)
      : null;
    const discount = coupon?.valid ? coupon.discount : 0;
    const total = Math.max(0, subtotal - discount);

    if (coupon?.valid && coupon.couponId) {
      const stored = findById<ICuponDescuento>('coupons', coupon.couponId);
      if (stored) update('coupons', { ...stored, veces_usado: stored.veces_usado + 1 });
    }

    const orderItems: IOrderItem[] = priced.map((item, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      product: {
        id: item.productId,
        name: item.name,
        slug: item.slug,
        images: [{ id: 'img', url: item.imageUrl, alt: item.name, isPrimary: true }],
        price: item.price,
      },
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      unitPrice: item.price,
    }));

    const now = new Date().toISOString();
    const order: IOrder = {
      id: `ord_${uid()}`,
      ticketId: generateTicketId(),
      items: orderItems,
      status: ORDER_STATUS.PROCESADO,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod ?? 'whatsapp',
      subtotal,
      discount,
      total,
      couponCode: coupon?.valid ? input.couponCode : undefined,
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    return insert('orders', order);
  },

  async getOrders(userId?: string): Promise<IOrder[]> {
    const orders = findAll('orders');
    if (!userId) return orders;
    return orders.filter((o) => o.customerId === userId);
  },

  async getOrderById(orderId: string): Promise<IOrder | null> {
    return findById<IOrder>('orders', orderId);
  },

  async getOrderByTicketId(ticketId: string): Promise<IOrder | null> {
    const orders = findAll('orders');
    return orders.find((o) => o.ticketId === ticketId) ?? null;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<IOrder | null> {
    const order = findById<IOrder>('orders', orderId);
    if (!order) return null;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    return update('orders', order);
  },
};
