import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { MediaAsset } from '../../domain/entities/media-asset.entity.js';
import type { MediaVariant } from '../../domain/entities/media-variant.entity.js';
import type { MediaAssetsRepository } from '../../domain/media-assets.repository.port.js';
import type { Revision } from '../../domain/value-objects/image-values.vo.js';
import type { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import type { MediaId } from '../../domain/value-objects/media-id.vo.js';
import { MediaAssetMapper, MediaVariantMapper } from './media.mapper.js';
import { MediaAssetOrmEntity, MediaVariantOrmEntity } from './media.orm-entities.js';

@Injectable()
export class TypeOrmMediaAssetsRepository implements MediaAssetsRepository {
  constructor(
    @InjectRepository(MediaAssetOrmEntity) private readonly assets: Repository<MediaAssetOrmEntity>,
    @InjectRepository(MediaVariantOrmEntity)
    private readonly variants: Repository<MediaVariantOrmEntity>
  ) {}

  async findById(id: MediaId): Promise<MediaAsset | null> {
    const row = await this.assets.findOneBy({ id: id.value });
    return row ? MediaAssetMapper.toDomain(row) : null;
  }

  async findByIds(ids: MediaId[]): Promise<MediaAsset[]> {
    if (ids.length === 0) return [];
    const rows = await this.assets.findBy({ id: In(ids.map((id) => id.value)) });
    return rows.map((row) => MediaAssetMapper.toDomain(row));
  }

  async list(): Promise<MediaAsset[]> {
    const rows = await this.assets.find({ order: { createdAt: 'DESC' } });
    return rows.map((row) => MediaAssetMapper.toDomain(row));
  }

  async save(asset: MediaAsset): Promise<void> {
    await this.assets.save(MediaAssetMapper.toRow(asset));
  }

  // Las variantes se borran en cascada (clave foránea).
  async delete(id: MediaId): Promise<void> {
    await this.assets.delete({ id: id.value });
  }

  async saveVariants(variants: MediaVariant[]): Promise<void> {
    await this.variants.save(variants.map((variant) => MediaVariantMapper.toRow(variant)));
  }

  async findVariant(
    id: MediaId,
    format: MediaFormat,
    revision: Revision
  ): Promise<MediaVariant | null> {
    const row = await this.variants.findOneBy({
      assetId: id.value,
      format: format.name,
      revision: revision.value,
    });
    return row ? MediaVariantMapper.toDomain(row) : null;
  }

  async listVariants(id: MediaId): Promise<MediaVariant[]> {
    const rows = await this.variants.find({ where: { assetId: id.value } });
    return rows.map((row) => MediaVariantMapper.toDomain(row));
  }

  async findObsoleteVariants(olderThan: Date): Promise<MediaVariant[]> {
    const rows = await this.variants
      .createQueryBuilder('v')
      .innerJoin(MediaAssetOrmEntity, 'a', 'a.id = v.asset_id')
      .where('v.revision < a.revision')
      .andWhere('v.created_at < :olderThan', { olderThan })
      .getMany();
    return rows.map((row) => MediaVariantMapper.toDomain(row));
  }

  async deleteVariants(variants: MediaVariant[]): Promise<void> {
    await this.variants.remove(variants.map((variant) => MediaVariantMapper.toRow(variant)));
  }
}
