import type { StoreSettings } from '../domain/entities/store-settings.entity.js';
import type { StoreSettingsRepository } from '../domain/store-settings.repository.port.js';

// Doble en memoria: debe pasar el mismo contrato que la implementación de Postgres.
export class InMemoryStoreSettingsRepository implements StoreSettingsRepository {
  private current: StoreSettings | null = null;

  find(): Promise<StoreSettings | null> {
    return Promise.resolve(this.current);
  }

  save(settings: StoreSettings): Promise<void> {
    this.current = settings;
    return Promise.resolve();
  }
}
