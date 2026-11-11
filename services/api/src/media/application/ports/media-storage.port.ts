export interface StoredObject {
  readonly body: Buffer;
  readonly contentType: string;
}

// Puerto de almacenamiento de archivos (SeaweedFS/S3 o disco). Las claves son rutas lógicas
// ("m/<id>/link-1.jpg"); quien implementa decide dónde viven. Lo implementa infraestructura.
export interface MediaStoragePort {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  // null si la clave no existe.
  get(key: string): Promise<StoredObject | null>;
  // Borra las claves dadas; las que no existen se ignoran.
  delete(keys: string[]): Promise<void>;
}

export const MEDIA_STORAGE = Symbol('MediaStoragePort');
