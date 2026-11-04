import type { IOrder } from '@src/core/models';

/**
 * Mensaje que el cliente envía al negocio. Regla de negocio: el pago y la confirmación
 * del pedido se hacen por WhatsApp, la web solo arma el pedido.
 */
export function buildOrderWhatsappMessage(order: IOrder): string {
  const { fullName, phone, address, city, reference } = order.shippingAddress;

  return [
    `Hola! Quiero confirmar mi pedido *${order.ticketId}*`,
    '',
    ...order.items.map(
      (item) =>
        `• ${item.quantity} x ${item.product.name} (talla ${item.selectedSize}, ${item.selectedColor}): Bs. ${(item.unitPrice * item.quantity).toFixed(2)}`
    ),
    '',
    ...(order.discount > 0 ? [`Descuento: -Bs. ${order.discount.toFixed(2)}`] : []),
    `*Total: Bs. ${order.total.toFixed(2)}* (envío por cobrar)`,
    '',
    `Nombre: ${fullName}`,
    `Teléfono: ${phone}`,
    `Entrega: ${address}, ${city}`,
    ...(reference ? [`Referencia: ${reference}`] : []),
    ...(order.notes ? [`Notas: ${order.notes}`] : []),
    '',
    '¿Me pasan los datos para pagar?',
  ].join('\n');
}
