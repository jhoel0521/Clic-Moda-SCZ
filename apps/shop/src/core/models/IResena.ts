export type EstadoModeracion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

/** Imagen de una reseña — tabla IMAGEN_RESENA */
export interface IImagenResena {
  id: string;
  resena_id: string;
  url_imagen: string;
}

/** Reseña de producto — tabla RESENA */
export interface IResena {
  id: string;
  producto_id: string;
  usuario_id: string;
  /** Nombre del autor (campo denormalizado para mostrar en UI) */
  autor_nombre?: string;
  calificacion_estrellas: number; // 1-5
  comentario: string;
  estado_moderacion: EstadoModeracion;
  imagenes: IImagenResena[];
  creado_en: string; // ISO date string
}

/** Datos para crear una nueva reseña */
export interface ICreateResenaData {
  producto_id: string;
  usuario_id: string;
  calificacion_estrellas: number;
  comentario: string;
}
