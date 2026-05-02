/** Cupón de descuento — tabla CUPON_DESCUENTO */
export interface ICuponDescuento {
  id: string;
  codigo: string;
  porcentaje_descuento: number; // 0-100
  fecha_caducidad: string; // ISO date string
  limite_usos: number;
  veces_usado: number;
}

/** Banner promocional — tabla BANNER_PROMOCIONAL */
export interface IBannerPromocional {
  id: string;
  titulo: string;
  descripcion?: string;
  url_pc: string;
  url_tablet: string;
  url_movil: string;
  activo: boolean;
}

/** Notificación de email vinculada a un pedido — tabla NOTIFICACION_EMAIL */
export interface INotificacionEmail {
  id: string;
  pedido_id: string;
  estado_enviado: 'PENDIENTE' | 'ENVIADO' | 'ERROR';
  enviado_en: string | null; // ISO date string, null si aún no se envió
}

/** Resultado de aplicar un cupón */
export interface IAplicacionCupon {
  valid: boolean;
  couponId?: string;
  codigo?: string;
  porcentaje?: number;
  discount: number; // monto descontado en BOB
  errorMessage?: string;
}
