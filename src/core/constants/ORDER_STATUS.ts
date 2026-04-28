/**
 * Estados del ciclo de vida de un pedido en Clic Moda SCZ.
 * Los estados son progresivos: no se puede retroceder.
 */
export const ORDER_STATUS = {
  PROCESADO: 'PROCESADO',
  EN_PREPARACION: 'EN_PREPARACION',
  LISTO_PARA_RECOGER: 'LISTO_PARA_RECOGER',
  ENVIANDO: 'ENVIANDO',
  ENTREGADO: 'ENTREGADO',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Etiquetas legibles para mostrar en la UI */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PROCESADO: 'Procesado',
  EN_PREPARACION: 'En preparación',
  LISTO_PARA_RECOGER: 'Listo para recoger',
  ENVIANDO: 'Enviando',
  ENTREGADO: 'Entregado',
};

/** Orden de progresión de los estados */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  ORDER_STATUS.PROCESADO,
  ORDER_STATUS.EN_PREPARACION,
  ORDER_STATUS.LISTO_PARA_RECOGER,
  ORDER_STATUS.ENVIANDO,
  ORDER_STATUS.ENTREGADO,
];

/** Retorna el siguiente estado posible, o null si ya es el último */
export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_SEQUENCE.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_SEQUENCE.length - 1) return null;
  return ORDER_STATUS_SEQUENCE[idx + 1];
}
