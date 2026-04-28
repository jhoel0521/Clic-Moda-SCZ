import { delay } from '@src/mocks/utils/delay';
import { ORDER_STATUS } from '@src/core/constants/ORDER_STATUS';
import type { OrderStatus } from '@src/core/constants/ORDER_STATUS';
import type { IOrder, IOrderItem, ICartItem, IShippingAddress, MetodoPago } from '@src/core/models';

const mockOrdersDB: IOrder[] = [];

function generateTicketId(): string {
  return `TICK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export interface ICreateOrderInput {
  items: ICartItem[];
  shippingAddress: IShippingAddress;
  paymentMethod?: MetodoPago;
  customerId?: string;
  customerEmail?: string;
  couponCode?: string;
  discount?: number;
  notes?: string;
}

export const MockOrderService = {
  async createOrder(input: ICreateOrderInput): Promise<IOrder> {
    await delay();

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
      id: `ord_${Date.now()}`,
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

    mockOrdersDB.push(order);
    return order;
  },

  async getOrders(userId?: string): Promise<IOrder[]> {
    await delay(100, 400);
    if (!userId) return [...mockOrdersDB];
    return mockOrdersDB.filter((o) => o.customerId === userId);
  },

  async getOrderById(orderId: string): Promise<IOrder | null> {
    await delay(100, 300);
    return mockOrdersDB.find((o) => o.id === orderId) ?? null;
  },

  async getOrderByTicketId(ticketId: string): Promise<IOrder | null> {
    await delay(100, 300);
    return mockOrdersDB.find((o) => o.ticketId === ticketId) ?? null;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<IOrder | null> {
    await delay(100, 200);
    const order = mockOrdersDB.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    return order;
  },
};
