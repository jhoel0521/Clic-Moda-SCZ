import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { StockLevel } from '../../domain/entities/stock-level.entity.js';
import type { StockLevelsRepository } from '../../domain/stock-levels.repository.port.js';
import type { VariantId } from '../../domain/value-objects/ids.vo.js';
import type { Location, ReorderLevel } from '../../domain/value-objects/stock-values.vo.js';
import { type LevelRow, toLevel } from './inventory.rows.js';

@Injectable()
export class TypeOrmStockLevelsRepository implements StockLevelsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findByVariantId(variantId: VariantId): Promise<StockLevel | null> {
    const rows: LevelRow[] = await this.dataSource.query(
      'SELECT * FROM stock_levels WHERE variant_id = $1',
      [variantId.value]
    );
    return rows[0] ? toLevel(rows[0]) : null;
  }

  // Crea la fila con cero unidades o actualiza solo ubicación y umbral (nunca las unidades).
  async saveSettings(
    variantId: VariantId,
    location: Location | null,
    reorderLevel: ReorderLevel
  ): Promise<StockLevel> {
    const rows: LevelRow[] = await this.dataSource.query(
      `INSERT INTO stock_levels (variant_id, location, reorder_level)
       VALUES ($1, $2, $3)
       ON CONFLICT (variant_id) DO UPDATE
         SET location = EXCLUDED.location, reorder_level = EXCLUDED.reorder_level, updated_at = now()
       RETURNING *`,
      [variantId.value, location?.value ?? null, reorderLevel.units]
    );
    return toLevel(rows[0] as LevelRow);
  }
}
