import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../../shared/infrastructure/config/env.schema.js';
import { ProcessNextStockCommandUseCase } from '../../application/use-cases/process-next-stock-command.use-case.js';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Procesa la cola de comandos de stock mientras la API está viva. Consulta cada STOCK_QUEUE_POLL_MS
// cuando no hay trabajo y sigue de inmediato cuando lo hay. STOCK_QUEUE_WORKER=off lo desactiva
// (para correrlo en otro proceso o en las pruebas, que lo invocan de forma determinista).
@Injectable()
export class StockCommandProcessor implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(StockCommandProcessor.name);
  private running = false;
  private loop: Promise<void> | null = null;

  constructor(
    private readonly processNext: ProcessNextStockCommandUseCase,
    private readonly config: ConfigService<Env, true>
  ) {}

  onApplicationBootstrap(): void {
    if (this.config.get('STOCK_QUEUE_WORKER', { infer: true }) === 'off') return;
    this.running = true;
    this.loop = this.run();
  }

  // Al apagar termina el comando en curso y no toma otro.
  async onApplicationShutdown(): Promise<void> {
    this.running = false;
    await this.loop;
  }

  private async run(): Promise<void> {
    const pollMs = this.config.get('STOCK_QUEUE_POLL_MS', { infer: true });
    while (this.running) {
      const worked = await this.tick();
      if (!worked && this.running) await sleep(pollMs);
    }
  }

  private async tick(): Promise<boolean> {
    try {
      return (await this.processNext.execute()) !== null;
    } catch (error) {
      this.logger.error(`Fallo al procesar la cola: ${String(error)}`);
      await sleep(1000);
      return false;
    }
  }
}
