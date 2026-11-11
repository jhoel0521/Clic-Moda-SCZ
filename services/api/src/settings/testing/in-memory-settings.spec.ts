import { InMemoryStoreSettingsRepository } from './in-memory-store-settings.repository.js';
import { storeSettingsRepositoryContract } from './store-settings-repository.contract.js';

storeSettingsRepositoryContract('InMemory', () =>
  Promise.resolve(new InMemoryStoreSettingsRepository())
);
