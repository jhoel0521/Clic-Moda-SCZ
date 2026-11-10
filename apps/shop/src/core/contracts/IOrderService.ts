import type { IOrder, OrderStatus, ICreateOrderInput } from '@src/core/models';

export interface IOrderService {
  createOrder(input: ICreateOrderInput): Promise<IOrder>;
  getOrders(userId?: string): Promise<IOrder[]>;
  getOrderById(orderId: string): Promise<IOrder | null>;
  getOrderByTicketId(ticketId: string): Promise<IOrder | null>;
  updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<IOrder | null>;
}
