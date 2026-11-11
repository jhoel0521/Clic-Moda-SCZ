import { CurrentUser } from '@nestjs/authentication';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { User } from '../../../identity/domain/entities/user.entity.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import {
  EnqueueStockCommand,
  GetStockCommandQuery,
  UpdateStockSettingsCommand,
} from '../../application/dtos/stock.dtos.js';
import { EnqueueStockCommandUseCase } from '../../application/use-cases/enqueue-stock-command.use-case.js';
import { GetQueueStatusUseCase } from '../../application/use-cases/get-queue-status.use-case.js';
import { GetStockCommandUseCase } from '../../application/use-cases/get-stock-command.use-case.js';
import { UpdateStockSettingsUseCase } from '../../application/use-cases/update-stock-settings.use-case.js';
import {
  type CommandResponseDto,
  type EnqueueDto,
  enqueueSchema,
  type QueueResponseDto,
  type SettingsDto,
  settingsSchema,
  toCommandResponse,
  toEnqueueResponse,
  toQueueResponse,
} from './inventory.dto.js';

const ALL = ['GERENTE', 'DESPACHO', 'ATENCION'] as const;
const WRITERS = ['GERENTE', 'DESPACHO'] as const;

// Adaptador de entrada HTTP de la cola de comandos: solo traduce petición y respuesta.
@Controller('inventory')
export class InventoryCommandsController {
  constructor(
    private readonly enqueue: EnqueueStockCommandUseCase,
    private readonly getCommand: GetStockCommandUseCase,
    private readonly queue: GetQueueStatusUseCase,
    private readonly settings: UpdateStockSettingsUseCase
  ) {}

  // 202: el comando quedó aceptado (PENDING); el stock cambia cuando el procesador lo resuelve.
  @Roles(...WRITERS)
  @Post('commands')
  @HttpCode(HttpStatus.ACCEPTED)
  async create(
    @Body({ schema: enqueueSchema }) body: EnqueueDto,
    @Headers('idempotency-key') key: string | undefined,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response
  ): Promise<CommandResponseDto> {
    const command = new EnqueueStockCommand(
      body.variantId,
      body.type,
      body.units,
      body.reason,
      user.id.value,
      key
    );
    const result = await this.enqueue.execute(command);
    res.setHeader('Location', `/inventory/commands/${result.command.id}`);
    return toEnqueueResponse(result);
  }

  @Roles(...ALL)
  @Get('commands/:id')
  async status(@Param('id') id: string): Promise<CommandResponseDto> {
    return toCommandResponse(await this.getCommand.execute(new GetStockCommandQuery(id)));
  }

  @Roles(...ALL)
  @Get('queue')
  async backlog(): Promise<QueueResponseDto> {
    return toQueueResponse(await this.queue.execute());
  }

  // Ubicación y umbral no cambian unidades: se guardan al instante, sin cola.
  @Roles(...WRITERS)
  @Patch('stock/:variantId/settings')
  async updateSettings(
    @Param('variantId') variantId: string,
    @Body({ schema: settingsSchema }) body: SettingsDto
  ) {
    return this.settings.execute(
      new UpdateStockSettingsCommand(variantId, body.location, body.reorderLevel)
    );
  }
}
