import type { IOrderService } from '@src/core/contracts/IOrderService';
import type { IOrder, IOrderItem, ICreateOrderInput, OrderStatus } from '@src/core/models';
import { ORDER_STATUS } from '@src/core/constants/ORDER_STATUS';
import { findAll, findById, insert, update } from '../db/db';
import crypto from 'crypto';

function generateTicketId(): string {
  return `TICK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const OrderService: IOrderService = {
  async createOrder(input: ICreateOrderInput): Promise<IOrder> {
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = input.discount ?? 0;
    const total = Math.max(0, subtotal - discount);

    const orderItems: IOrderItem[] = input.items.map((item, idx) => ({
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
      id: `ord_${crypto.randomUUID()}`,
      ticketId: generateTicketId(),
      items: orderItems,
      status: ORDER_STATUS.PROCESADO,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod ?? 'qr_simple',
      subtotal,
      discount,
      total,
      couponCode: input.couponCode,
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
