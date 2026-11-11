// Lo que el catálogo necesita saber de las imágenes del módulo de medios: cuáles existen y están publicadas,
// su revisión vigente (para armar la ruta pública) y su texto alternativo. UNA consulta para toda la lista
// (sin N+1). Lo implementa infraestructura sobre el módulo de medios; este contexto no importa nada de él.
export interface MediaReference {
  readonly id: string;
  readonly revision: number;
  readonly alt: string;
}

export interface MediaReferencesPort {
  // Solo las que existen y están publicadas; el orden no está garantizado.
  findPublished(ids: readonly string[]): Promise<MediaReference[]>;
}

export const CATALOG_MEDIA_REFERENCES = Symbol('CatalogMediaReferencesPort');
