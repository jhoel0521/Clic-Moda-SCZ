import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { VariantHasMovementsPort } from '../../application/ports/variant-has-movements.port.js';
import type { VariantId } from '../../domain/value-objects/ids.vo.js';

// Consulta de solo lectura a las tablas de inventario: `catalog` no importa código de `inventory`.
// Mira los comandos (y no solo los movimientos) para que un SKU con stock en cola tampoco cambie.
@Injectable()
export class SqlVariantHasMovements implements VariantHasMovementsPort {
  constructor(private readonly dataSource: DataSource) {}

  async hasMovements(id: VariantId): Promise<boolean> {
    const rows = await this.dataSource.query(
      'SELECT 1 FROM stock_commands WHERE variant_id = $1 LIMIT 1',
      [id.value]
    );
    return rows.length > 0;
  }
}
