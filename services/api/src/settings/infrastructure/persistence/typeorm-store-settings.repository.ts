import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StoreSettings } from '../../domain/entities/store-settings.entity.js';
import type { StoreSettingsRepository } from '../../domain/store-settings.repository.port.js';
import { SETTINGS_ROW_ID, StoreSettingsMapper } from './store-settings.mapper.js';
import { StoreSettingsOrmEntity } from './store-settings.orm-entities.js';

@Injectable()
export class TypeOrmStoreSettingsRepository implements StoreSettingsRepository {
  constructor(
    @InjectRepository(StoreSettingsOrmEntity)
    private readonly rows: Repository<StoreSettingsOrmEntity>
  ) {}

  async find(): Promise<StoreSettings | null> {
    const row = await this.rows.findOneBy({ id: SETTINGS_ROW_ID });
    return row ? StoreSettingsMapper.toDomain(row) : null;
  }

  // `save` de TypeORM hace insert o update por la clave primaria (siempre la misma fila).
  async save(settings: StoreSettings): Promise<void> {
    await this.rows.save(StoreSettingsMapper.toRow(settings));
  }
}
