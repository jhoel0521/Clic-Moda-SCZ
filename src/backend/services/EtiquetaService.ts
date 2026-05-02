import type { IEtiquetaService } from '@src/core/contracts/IEtiquetaService';
import type { IEtiqueta, IProduct } from '@src/core/models';
import { findAll, findById, insert, update, remove, saveDb, getDb } from '../db/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const EtiquetaService: IEtiquetaService = {
  async getAll(): Promise<IEtiqueta[]> {
    return findAll('etiquetas');
  },

  async getById(id: string): Promise<IEtiqueta | null> {
    return findById<IEtiqueta>('etiquetas', id);
  },

  async create(nombre: string): Promise<IEtiqueta> {
    const existing = findAll('etiquetas');
    const slug = slugify(nombre);
    const dupe = existing.find(
      (e) => e.slug === slug || e.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (dupe) return dupe;

    const etiqueta: IEtiqueta = {
      id: `etag_${Date.now()}`,
      nombre,
      slug,
    };
    return insert('etiquetas', etiqueta);
  },

  async update(id: string, nombre: string): Promise<IEtiqueta | null> {
    const etiqueta = findById<IEtiqueta>('etiquetas', id);
    if (!etiqueta) return null;
    const slug = slugify(nombre);
    const updated: IEtiqueta = { ...etiqueta, nombre, slug };
    update('etiquetas', updated);

    const db = getDb();
    for (const p of db.products) {
      if (p.etiquetaIds.includes(id)) {
        const idx = p.etiquetaIds.indexOf(id);
        p.tagNames[idx] = nombre;
      }
    }
    saveDb(db);

    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const etiqueta = findById<IEtiqueta>('etiquetas', id);
    if (!etiqueta) return false;

    remove('etiquetas', id);

    const db = getDb();
    for (const p of db.products) {
      if (p.etiquetaIds.includes(id)) {
        const idx = p.etiquetaIds.indexOf(id);
        p.etiquetaIds.splice(idx, 1);
        p.tagNames.splice(idx, 1);
      }
    }
    saveDb(db);

    return true;
  },

  async getByProducto(productoId: string): Promise<IEtiqueta[]> {
    const product = findById<IProduct>('products', productoId);
    if (!product) return [];
    const all = findAll('etiquetas');
    return all.filter((e) => product.etiquetaIds.includes(e.id));
  },
};
