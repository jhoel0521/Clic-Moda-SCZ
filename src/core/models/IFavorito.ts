/** Producto favorito de un usuario — tabla FAVORITO */
export interface IFavorito {
  usuario_id: string;
  producto_id: string;
  agregado_en: string; // ISO date string
}
