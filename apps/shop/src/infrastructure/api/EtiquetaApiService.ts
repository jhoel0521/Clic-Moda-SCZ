import type { IEtiquetaService } from '@src/core/contracts/IEtiquetaService';
import type { IEtiqueta } from '@src/core/models';
import { apiFetch } from '@src/services/api';

export const EtiquetaApiService: IEtiquetaService = {
  async getAll() {
    return apiFetch<IEtiqueta[]>('/api/etiquetas');
  },

  async getById(id: string) {
    return apiFetch<IEtiqueta>(`/api/etiquetas/${id}`);
  },

  async create(nombre: string) {
    return apiFetch<IEtiqueta>('/api/etiquetas', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  },

  async update(id: string, nombre: string) {
    return apiFetch<IEtiqueta>(`/api/etiquetas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre }),
    });
  },

  async remove(id: string) {
    const res = await apiFetch<{ success: boolean }>(`/api/etiquetas/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async getByProducto(productoId: string) {
    return apiFetch<IEtiqueta[]>(`/api/etiquetas?productoId=${productoId}`);
  },
};
