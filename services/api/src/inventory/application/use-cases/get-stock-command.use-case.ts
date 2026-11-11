import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { CommandNotFoundError } from '../../domain/errors/inventory.errors.js';
import {
  STOCK_COMMANDS_REPOSITORY,
  type StockCommandsRepository,
} from '../../domain/stock-commands.repository.port.js';
import { CommandId } from '../../domain/value-objects/ids.vo.js';
import {
  type GetStockCommandQuery,
  type StockCommandResult,
  toCommandResult,
} from '../dtos/stock.dtos.js';

// Consulta el estado y el resultado de un comando por su id (el cliente la repite hasta el final).
@Injectable()
export class GetStockCommandUseCase implements UseCase<GetStockCommandQuery, StockCommandResult> {
  constructor(
    @Inject(STOCK_COMMANDS_REPOSITORY) private readonly commands: StockCommandsRepository
  ) {}

  async execute(query: GetStockCommandQuery): Promise<StockCommandResult> {
    const command = await this.commands.findById(CommandId.of(query.id));
    if (!command) throw new CommandNotFoundError();
    return toCommandResult(command);
  }
}
