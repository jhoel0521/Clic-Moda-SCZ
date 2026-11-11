import { InMemoryMediaAssetsRepository } from './in-memory-media-assets.repository.js';
import { InMemoryMediaStorage } from './in-memory-media-storage.js';
import { mediaAssetsRepositoryContract } from './media-assets-repository.contract.js';
import { mediaStorageContract } from './media-storage.contract.js';

mediaAssetsRepositoryContract('fake en memoria', () => new InMemoryMediaAssetsRepository());
mediaStorageContract('fake en memoria', () => new InMemoryMediaStorage());
