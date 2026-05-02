import type { IEtiqueta } from '@src/core/models';

export interface IEtiquetaService {
  getAll(): Promise<IEtiqueta[]>;
  getById(id: string): Promise<IEtiqueta | null>;
  create(nombre: string): Promise<IEtiqueta>;
  update(id: string, nombre: string): Promise<IEtiqueta | null>;
  remove(id: string): Promise<boolean>;
  getByProducto(productoId: string): Promise<IEtiqueta[]>;
}
