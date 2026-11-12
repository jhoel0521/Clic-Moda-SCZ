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
import {
  MOVEMENT_TYPES_REPOSITORY,
  type MovementTypesRepository,
} from '../../domain/movement-types.repository.port.js';
import { type CommandType, parseCommandType } from '../../domain/value-objects/command-values.js';
import { TypeCode } from '../../domain/value-objects/type-values.vo.js';
import { requireType } from '../support/movement-type-access.js';
import { DomainError, FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
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
    @Inject(MOVEMENT_TYPES_REPOSITORY) private readonly types: MovementTypesRepository,
    @Inject(VARIANT_LOOKUP) private readonly variants: VariantLookupPort,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(input: EnqueueStockCommand): Promise<EnqueueResult> {
    const type = parseCommandType(input.type);
    const variantId = VariantId.of(input.variantId);
    const typeCode = await this.resolveType(type, input.typeCode);
    const command = StockCommand.accept(
      {
        variantId,
        type,
        typeCode,
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

  // Sin código: el tipo de sistema de la clase. Con código: debe existir, estar activo y ser de la misma
  // clase; si no, se rechaza de inmediato (sin crear el comando) y el error apunta al campo del tipo.
  private async resolveType(kind: CommandType, raw?: string | null): Promise<TypeCode> {
    if (!raw) return TypeCode.of(kind);
    try {
      const type = await requireType(this.types, raw);
      type.assertUsableFor(kind);
      return type.code;
    } catch (error) {
      if (!(error instanceof DomainError) || error instanceof FieldValidationError) throw error;
      throw new FieldValidationError([{ field: 'typeCode', message: error.message }]);
    }
  }

  private async assertVariantUsable(variantId: VariantId): Promise<void> {
    const variant = await this.variants.lookup(variantId);
    if (!variant) throw new VariantUnavailableError();
    if (!variant.active) throw new VariantInactiveError();
  }
}
