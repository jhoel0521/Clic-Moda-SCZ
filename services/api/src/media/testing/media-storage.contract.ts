import type { MediaStoragePort } from '../application/ports/media-storage.port.js';

type Factory = () => Promise<MediaStoragePort> | MediaStoragePort;

const bytes = (text: string): Buffer => Buffer.from(text);
// Cada caso usa claves únicas: el almacenamiento real (SeaweedFS) no se vacía entre pruebas.
const key = (name: string): string => `contract/${crypto.randomUUID()}/${name}`;

function readWriteCases(make: Factory): void {
  it('guarda un archivo y lo devuelve con su contenido y tipo', async () => {
    const [storage, k] = [await make(), key('link-1.jpg')];
    await storage.put(k, bytes('hola'), 'image/jpeg');

    const found = await storage.get(k);
    expect([found?.body.toString(), found?.contentType]).toEqual(['hola', 'image/jpeg']);
  });

  it('get devuelve null si la clave no existe', async () => {
    expect(await (await make()).get(key('nada.jpg'))).toBeNull();
  });

  it('guardar otra vez la misma clave la reemplaza', async () => {
    const [storage, k] = [await make(), key('card-1.webp')];
    await storage.put(k, bytes('uno'), 'image/webp');
    await storage.put(k, bytes('dos'), 'image/webp');

    expect((await storage.get(k))?.body.toString()).toBe('dos');
  });
}

function deleteCases(make: Factory): void {
  it('delete borra solo las claves dadas', async () => {
    const [storage, a, b] = [await make(), key('a.jpg'), key('b.jpg')];
    await storage.put(a, bytes('a'), 'image/jpeg');
    await storage.put(b, bytes('b'), 'image/jpeg');
    await storage.delete([a]);

    expect(await storage.get(a)).toBeNull();
    expect(await storage.get(b)).not.toBeNull();
  });

  it('delete ignora las claves que no existen', async () => {
    await expect((await make()).delete([key('fantasma.jpg')])).resolves.toBeUndefined();
  });

  it('delete acepta una lista vacía', async () => {
    await expect((await make()).delete([])).resolves.toBeUndefined();
  });
}

// Suite de contrato: toda implementación del puerto (memoria, disco y S3) debe pasarla.
export function mediaStorageContract(label: string, make: Factory): void {
  describe(`MediaStoragePort: ${label}`, () => {
    readWriteCases(make);
    deleteCases(make);
  });
}
