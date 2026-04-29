import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { IOrderService } from '@src/core/contracts/IOrderService';
import type { IOrder, ICreateOrderInput, OrderStatus } from '@src/core/models';

export const OrderService: IOrderService = {
  async createOrder(input: ICreateOrderInput) {
    const service = await ServiceFactory.getOrderService();
    return service.createOrder(input);
  },

  async getOrders(userId?: string) {
    const service = await ServiceFactory.getOrderService();
    return service.getOrders(userId);
  },

  async getOrderById(orderId: string) {
    const service = await ServiceFactory.getOrderService();
    return service.getOrderById(orderId);
  },

  async getOrderByTicketId(ticketId: string) {
    const service = await ServiceFactory.getOrderService();
    return service.getOrderByTicketId(ticketId);
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const service = await ServiceFactory.getOrderService();
    return service.updateOrderStatus(orderId, newStatus);
  },
};
