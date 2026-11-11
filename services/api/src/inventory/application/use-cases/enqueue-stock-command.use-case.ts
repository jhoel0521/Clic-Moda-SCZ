import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { StockCommand } from '../../domain/entities/stock-command.entity.js';
import {
  VariantInactiveError,
  VariantUnavailableError,
} from '../../domain/errors/inventory.errors.js';
import {
  STOCK_COMMANDS_REPOSITORY,
  type StockCommandsRepository,
} from '../../domain/stock-commands.repository.port.js';
import { parseCommandType } from '../../domain/value-objects/command-values.js';
import { VariantId } from '../../domain/value-objects/ids.vo.js';
import {
  IdempotencyKey,
  Operator,
  Quantity,
  Reason,
} from '../../domain/value-objects/stock-values.vo.js';
import {
  type EnqueueResult,
  type EnqueueStockCommand,
  toCommandResult,
} from '../dtos/stock.dtos.js';
import {
  CLOCK,
  type ClockPort,
  VARIANT_LOOKUP,
  type VariantLookupPort,
} from '../ports/inventory.ports.js';

// Acepta un cambio de stock: lo valida, lo guarda de forma duradera y responde PENDING. El stock NO
// cambia aquí: lo aplica el procesador de la cola, en orden de llegada.
@Injectable()
export class EnqueueStockCommandUseCase implements UseCase<EnqueueStockCommand, EnqueueResult> {
  constructor(
    @Inject(STOCK_COMMANDS_REPOSITORY) private readonly commands: StockCommandsRepository,
    @Inject(VARIANT_LOOKUP) private readonly variants: VariantLookupPort,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(input: EnqueueStockCommand): Promise<EnqueueResult> {
    const type = parseCommandType(input.type);
    const variantId = VariantId.of(input.variantId);
    const command = StockCommand.accept(
      {
        variantId,
        type,
        quantity: type === 'ADJUST' ? Quantity.count(input.units) : Quantity.positive(input.units),
        reason: Reason.of(input.reason),
        operator: Operator.of(input.operator),
        idempotencyKey: input.idempotencyKey ? IdempotencyKey.of(input.idempotencyKey) : null,
      },
      this.clock.now()
    );
    await this.assertVariantUsable(variantId);
    const outcome = await this.commands.enqueue(command);
    return { command: toCommandResult(outcome.command), created: outcome.created };
  }

  private async assertVariantUsable(variantId: VariantId): Promise<void> {
    const variant = await this.variants.lookup(variantId);
    if (!variant) throw new VariantUnavailableError();
    if (!variant.active) throw new VariantInactiveError();
  }
}
