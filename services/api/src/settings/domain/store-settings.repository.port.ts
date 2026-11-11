import type { StoreSettings } from './entities/store-settings.entity.js';

// Puerto de repositorio: la tienda tiene UNA sola configuración (una fila).
export interface StoreSettingsRepository {
  // null si todavía no se guardó nada (se usa la semilla).
  find(): Promise<StoreSettings | null>;
  // Crea o reemplaza la única configuración.
  save(settings: StoreSettings): Promise<void>;
}

export const STORE_SETTINGS_REPOSITORY = Symbol('StoreSettingsRepository');
