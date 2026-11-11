import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { VariantUnavailableError } from '../../domain/errors/inventory.errors.js';
import {
  STOCK_LEVELS_REPOSITORY,
  type StockLevelsRepository,
} from '../../domain/stock-levels.repository.port.js';
import { VariantId } from '../../domain/value-objects/ids.vo.js';
import { Location, ReorderLevel } from '../../domain/value-objects/stock-values.vo.js';
import type { UpdateStockSettingsCommand } from '../dtos/stock.dtos.js';
import { VARIANT_LOOKUP, type VariantLookupPort } from '../ports/inventory.ports.js';

export interface StockSettingsResult {
  readonly variantId: string;
  readonly location: string | null;
  readonly reorderLevel: number;
}

// Ubicación y umbral no son contendidos (no cambian las unidades), así que se guardan sin cola.
@Injectable()
export class UpdateStockSettingsUseCase implements UseCase<
  UpdateStockSettingsCommand,
  StockSettingsResult
> {
  constructor(
    @Inject(STOCK_LEVELS_REPOSITORY) private readonly levels: StockLevelsRepository,
    @Inject(VARIANT_LOOKUP) private readonly variants: VariantLookupPort
  ) {}

  async execute(command: UpdateStockSettingsCommand): Promise<StockSettingsResult> {
    const variantId = VariantId.of(command.variantId);
    if (!(await this.variants.lookup(variantId))) throw new VariantUnavailableError();
    const location = command.location?.trim() ? Location.of(command.location) : null;
    const saved = await this.levels.saveSettings(
      variantId,
      location,
      ReorderLevel.of(command.reorderLevel)
    );
    return {
      variantId: variantId.value,
      location: saved.location?.value ?? null,
      reorderLevel: saved.reorderLevel.units,
    };
  }
}
