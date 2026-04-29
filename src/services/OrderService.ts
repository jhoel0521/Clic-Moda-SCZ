import type { IOrderService } from '@src/core/contracts/IOrderService';
import { apiFetch } from './api';

export const OrderService: IOrderService = {
  async createOrder(input) {
    return apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getOrders(userId) {
    const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
    return apiFetch(url);
  },

  async getOrderById(orderId) {
    return apiFetch(`/api/orders/${orderId}`);
  },

  async getOrderByTicketId(ticketId) {
    const orders = await apiFetch<any[]>('/api/orders');
    return orders.find((o) => o.ticketId === ticketId) ?? null;
  },

  async updateOrderStatus(orderId, newStatus) {
    return apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  },
};
