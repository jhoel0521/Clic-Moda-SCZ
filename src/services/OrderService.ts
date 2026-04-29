import type { IOrderService } from '@src/core/contracts/IOrderService';
import type { IOrder, ICreateOrderInput, OrderStatus } from '@src/core/models';
import { apiFetch } from './api';

export const OrderService: IOrderService = {
  async createOrder(input: ICreateOrderInput) {
    return apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getOrders(userId?: string) {
    const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
    return apiFetch(url);
  },

  async getOrderById(orderId: string) {
    return apiFetch(`/api/orders/${orderId}`);
  },

  async getOrderByTicketId(ticketId: string) {
    const orders = await apiFetch<IOrder[]>('/api/orders');
    return orders.find((o) => o.ticketId === ticketId) ?? null;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    return apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  },
};
