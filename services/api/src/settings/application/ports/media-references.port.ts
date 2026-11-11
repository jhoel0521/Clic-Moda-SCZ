// Lo que la configuración necesita saber de una imagen del módulo de medios: que exista y esté publicada,
// su revisión vigente (para armar la ruta pública) y su texto alternativo. Lo implementa infraestructura
// sobre el módulo de medios; este contexto no importa nada de él.
export interface MediaReference {
  readonly id: string;
  readonly revision: number;
  readonly alt: string;
}

export interface MediaReferencesPort {
  // null si la imagen no existe o no está publicada.
  find(id: string): Promise<MediaReference | null>;
}

export const MEDIA_REFERENCES = Symbol('MediaReferencesPort');
