import type { MediaAsset } from '../domain/entities/media-asset.entity.js';
import type { MediaVariant } from '../domain/entities/media-variant.entity.js';
import type { MediaAssetsRepository } from '../domain/media-assets.repository.port.js';
import type { Revision } from '../domain/value-objects/image-values.vo.js';
import type { MediaFormat } from '../domain/value-objects/media-format.vo.js';
import type { MediaId } from '../domain/value-objects/media-id.vo.js';

// Doble en memoria del repositorio: debe pasar el mismo contrato que la implementación de Postgres.
export class InMemoryMediaAssetsRepository implements MediaAssetsRepository {
  private readonly assets = new Map<string, MediaAsset>();
  private variants = new Map<string, MediaVariant>();

  findById(id: MediaId): Promise<MediaAsset | null> {
    return Promise.resolve(this.assets.get(id.value) ?? null);
  }

  findByIds(ids: MediaId[]): Promise<MediaAsset[]> {
    const found = ids.flatMap((id) => this.assets.get(id.value) ?? []);
    return Promise.resolve(found);
  }

  list(): Promise<MediaAsset[]> {
    const all = [...this.assets.values()];
    return Promise.resolve(all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }

  save(asset: MediaAsset): Promise<void> {
    this.assets.set(asset.id.value, asset);
    return Promise.resolve();
  }

  delete(id: MediaId): Promise<void> {
    this.assets.delete(id.value);
    const kept = [...this.variants.entries()].filter(([, v]) => !v.assetId.equals(id));
    this.variants = new Map(kept);
    return Promise.resolve();
  }

  saveVariants(variants: MediaVariant[]): Promise<void> {
    for (const variant of variants) this.variants.set(variant.storageKey, variant);
    return Promise.resolve();
  }

  findVariant(id: MediaId, format: MediaFormat, revision: Revision): Promise<MediaVariant | null> {
    const key = `m/${id.value}/${format.name}-${String(revision.value)}.${format.extension}`;
    return Promise.resolve(this.variants.get(key) ?? null);
  }

  listVariants(id: MediaId): Promise<MediaVariant[]> {
    const own = [...this.variants.values()].filter((v) => v.assetId.equals(id));
    return Promise.resolve(own);
  }

  findObsoleteVariants(olderThan: Date): Promise<MediaVariant[]> {
    const obsolete = [...this.variants.values()].filter((variant) => {
      const asset = this.assets.get(variant.assetId.value);
      const superseded = asset ? variant.revision.value < asset.revision.value : true;
      return superseded && variant.createdAt < olderThan;
    });
    return Promise.resolve(obsolete);
  }

  deleteVariants(variants: MediaVariant[]): Promise<void> {
    for (const variant of variants) this.variants.delete(variant.storageKey);
    return Promise.resolve();
  }
}
