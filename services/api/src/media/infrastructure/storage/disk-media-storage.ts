import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import type { MediaStoragePort, StoredObject } from '../../application/ports/media-storage.port.js';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

// Respaldo local (desarrollo o instalaciones pequeñas). El tipo se deduce de la extensión de la clave.
export class DiskMediaStorage implements MediaStoragePort {
  private readonly root: string;

  constructor(dir: string) {
    this.root = resolve(dir);
  }

  // Las claves las arma el sistema, pero se comprueba igual que nunca salgan de la carpeta raíz.
  private pathOf(key: string): string {
    const full = resolve(this.root, key);
    if (!full.startsWith(this.root + sep))
      throw new Error(`Clave fuera del almacenamiento: ${key}`);
    return full;
  }

  async put(key: string, body: Buffer): Promise<void> {
    const file = this.pathOf(key);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, body);
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const body = await readFile(this.pathOf(key));
      const contentType = CONTENT_TYPES[extname(key)] ?? 'application/octet-stream';
      return { body, contentType };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async delete(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => rm(this.pathOf(key), { force: true })));
  }
}
