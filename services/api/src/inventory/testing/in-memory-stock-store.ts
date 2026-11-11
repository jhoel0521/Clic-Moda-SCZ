import type { StockCommand } from '../domain/entities/stock-command.entity.js';
import type { StockLevel } from '../domain/entities/stock-level.entity.js';
import type { StockMovement } from '../domain/entities/stock-movement.entity.js';

// Estado compartido de los fakes en memoria del inventario: los repositorios, el procesamiento y las
// consultas ven los mismos datos, igual que con una sola base de datos.
export class InMemoryStockStore {
  readonly commands = new Map<string, StockCommand>();
  readonly levels = new Map<string, StockLevel>();
  readonly movements: StockMovement[] = [];
  // Directorio de variantes (lo que `catalog` conoce): lo usa el modelo de lectura para unir datos.
  readonly variants = new Map<
    string,
    { sku: string; productName: string; size: string; color: string | null; active: boolean }
  >();
  private seq = 0;

  nextSeq(): number {
    this.seq += 1;
    return this.seq;
  }
}
