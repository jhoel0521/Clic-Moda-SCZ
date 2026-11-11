import type { MediaStoragePort, StoredObject } from '../application/ports/media-storage.port.js';

// Doble en memoria del almacenamiento: debe pasar el mismo contrato que S3 y disco.
export class InMemoryMediaStorage implements MediaStoragePort {
  private readonly objects = new Map<string, StoredObject>();

  put(key: string, body: Buffer, contentType: string): Promise<void> {
    this.objects.set(key, { body, contentType });
    return Promise.resolve();
  }

  get(key: string): Promise<StoredObject | null> {
    return Promise.resolve(this.objects.get(key) ?? null);
  }

  delete(keys: string[]): Promise<void> {
    for (const key of keys) this.objects.delete(key);
    return Promise.resolve();
  }

  keys(): string[] {
    return [...this.objects.keys()].sort();
  }
}
