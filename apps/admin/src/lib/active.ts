import { api } from './client-api';

// Habilitar/deshabilitar un registro con un toque. Nada se borra: un registro inactivo se puede reactivar.
export const setProductActive = (id: string, active: boolean): Promise<unknown> =>
  api('PATCH', `catalog/products/${id}/active`, { active });

export const setVariantActive = (id: string, active: boolean): Promise<unknown> =>
  api('PATCH', `catalog/variants/${id}/active`, { active });
