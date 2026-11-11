import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PurgeObsoleteMediaCommand } from '../../application/dtos/media.dtos.js';
import {
  MEDIA_STORAGE,
  type MediaStoragePort,
} from '../../application/ports/media-storage.port.js';
import { PurgeObsoleteMediaUseCase } from '../../application/use-cases/purge-obsolete-media.use-case.js';
import { MEDIA_LIMITS } from '../../domain/media-limits.js';
import { S3MediaStorage } from '../storage/s3-media-storage.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Al arrancar: crea el bucket si hace falta y depura revisiones viejas; luego lo repite cada día.
@Injectable()
export class MediaLifecycle implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaLifecycle.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort,
    private readonly purge: PurgeObsoleteMediaUseCase
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.storage instanceof S3MediaStorage) await this.storage.ensureBucket();
    if (process.env.NODE_ENV === 'test') return;
    await this.purgeOld();
    this.timer = setInterval(() => void this.purgeOld(), DAY_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  private async purgeOld(): Promise<void> {
    try {
      const olderThan = new Date(Date.now() - MEDIA_LIMITS.keepObsoleteDays * DAY_MS);
      const removed = await this.purge.execute(new PurgeObsoleteMediaCommand(olderThan));
      if (removed > 0)
        this.logger.log(`Revisiones antiguas de imágenes borradas: ${String(removed)}`);
    } catch (error) {
      this.logger.error('No se pudieron depurar las revisiones antiguas', error as Error);
    }
  }
}
