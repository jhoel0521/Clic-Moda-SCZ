import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { VariantLookupPort } from '../../application/ports/inventory.ports.js';
import type { VariantId } from '../../domain/value-objects/ids.vo.js';

// Consulta de solo lectura a las variantes del catálogo: `inventory` no importa código de `catalog`.
@Injectable()
export class SqlVariantLookup implements VariantLookupPort {
  constructor(private readonly dataSource: DataSource) {}

  async lookup(id: VariantId): Promise<{ readonly active: boolean } | null> {
    const rows: { active: boolean }[] = await this.dataSource.query(
      'SELECT active FROM product_variants WHERE id = $1',
      [id.value]
    );
    return rows[0] ? { active: rows[0].active } : null;
  }
}
