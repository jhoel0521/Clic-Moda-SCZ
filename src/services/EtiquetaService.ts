import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { IEtiquetaService } from '@src/core/contracts/IEtiquetaService';

export const EtiquetaService: IEtiquetaService = {
  async getAll() {
    const service = await ServiceFactory.getEtiquetaService();
    return service.getAll();
  },

  async getById(id: string) {
    const service = await ServiceFactory.getEtiquetaService();
    return service.getById(id);
  },

  async create(nombre: string) {
    const service = await ServiceFactory.getEtiquetaService();
    return service.create(nombre);
  },

  async update(id: string, nombre: string) {
    const service = await ServiceFactory.getEtiquetaService();
    return service.update(id, nombre);
  },

  async remove(id: string) {
    const service = await ServiceFactory.getEtiquetaService();
    return service.remove(id);
  },

  async getByProducto(productoId: string) {
    const service = await ServiceFactory.getEtiquetaService();
    return service.getByProducto(productoId);
  },
};
