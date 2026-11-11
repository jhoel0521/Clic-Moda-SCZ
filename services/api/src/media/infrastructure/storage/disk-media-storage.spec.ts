import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mediaStorageContract } from '../../testing/media-storage.contract.js';
import { DiskMediaStorage } from './disk-media-storage.js';

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'clic-moda-media-'));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

mediaStorageContract('disco', () => new DiskMediaStorage(dir));

describe('DiskMediaStorage: seguridad', () => {
  it('se niega a salir de la carpeta raíz', async () => {
    const storage = new DiskMediaStorage(dir);

    await expect(storage.put('../fuera.jpg', Buffer.from('x'))).rejects.toThrow('fuera');
    await expect(storage.get('../../etc/passwd')).rejects.toThrow('fuera');
  });

  it('deduce el tipo de la extensión (png, webp y desconocido)', async () => {
    const storage = new DiskMediaStorage(dir);
    await storage.put('t/a.png', Buffer.from('p'));
    await storage.put('t/b.bin', Buffer.from('b'));

    expect((await storage.get('t/a.png'))?.contentType).toBe('image/png');
    expect((await storage.get('t/b.bin'))?.contentType).toBe('application/octet-stream');
  });
});
