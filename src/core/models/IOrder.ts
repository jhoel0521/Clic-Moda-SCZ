import type { OrderStatus } from '@src/core/constants/ORDER_STATUS';
import type { IProduct, Talla } from '@src/core/models/IProduct';

/** Ítem dentro de un pedido */
export interface IOrderItem {
  id: string;
  product: Pick<IProduct, 'id' | 'name' | 'slug' | 'images' | 'price'>;
  quantity: number;
  selectedSize: Talla;
  selectedColor: string;
  unitPrice: number; // precio al momento de la compra (puede diferir del actual)
}

/** Dirección de envío del pedido */
export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  reference?: string;
}

/** Métodos de pago aceptados */
export type MetodoPago = 'transferencia' | 'qr_simple' | 'efectivo_entrega' | 'contra_entrega';

/** Pedido completo */
export interface IOrder {
  id: string;
  /** ID público del ticket, formato TICK-XXXXXX */
  ticketId: string;
  items: IOrderItem[];
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  paymentMethod: MetodoPago;
  subtotal: number;
  discount: number;
  total: number;
  /** ID del cupón aplicado — PEDIDO.cupon_id */
  couponId?: string;
  /** Código legible del cupón (para mostrar en UI) */
  couponCode?: string;
  customerId?: string; // null si compró como invitado
  customerEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Ítem del carrito de compras (pre-pedido) */
export interface ICartItem {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize: Talla;
  selectedColor: string;
}
