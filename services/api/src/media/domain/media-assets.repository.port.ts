import type { MediaAsset } from './entities/media-asset.entity.js';
import type { MediaVariant } from './entities/media-variant.entity.js';
import type { MediaFormat } from './value-objects/media-format.vo.js';
import type { MediaId } from './value-objects/media-id.vo.js';
import type { Revision } from './value-objects/image-values.vo.js';

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
export interface MediaAssetsRepository {
  findById(id: MediaId): Promise<MediaAsset | null>;
  // Varias imágenes en UNA consulta (sin orden garantizado). Las que no existen simplemente no vienen.
  findByIds(ids: MediaId[]): Promise<MediaAsset[]>;
  // De la más reciente a la más antigua.
  list(): Promise<MediaAsset[]>;
  // Crea o actualiza (por id).
  save(asset: MediaAsset): Promise<void>;
  // Borra la imagen y todas sus variantes.
  delete(id: MediaId): Promise<void>;

  // Agrega variantes (si ya existe la misma imagen, formato y revisión, la reemplaza).
  saveVariants(variants: MediaVariant[]): Promise<void>;
  findVariant(id: MediaId, format: MediaFormat, revision: Revision): Promise<MediaVariant | null>;
  listVariants(id: MediaId): Promise<MediaVariant[]>;
  // Variantes de revisiones que ya no son la vigente y se crearon antes de `olderThan`.
  findObsoleteVariants(olderThan: Date): Promise<MediaVariant[]>;
  deleteVariants(variants: MediaVariant[]): Promise<void>;
}

export const MEDIA_ASSETS_REPOSITORY = Symbol('MediaAssetsRepository');
