import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envSchema } from '../shared/infrastructure/config/env.schema.js';
import { readMediaConfig } from '../shared/infrastructure/config/media-config.js';
import { IMAGE_PROCESSOR } from './application/ports/image-processor.port.js';
import { MEDIA_STORAGE, type MediaStoragePort } from './application/ports/media-storage.port.js';
import { BackfillMissingVariantsUseCase } from './application/use-cases/backfill-missing-variants.use-case.js';
import { ChangeFocalPointUseCase } from './application/use-cases/change-focal-point.use-case.js';
import { DeleteMediaUseCase } from './application/use-cases/delete-media.use-case.js';
import { GetMediaMasterUseCase } from './application/use-cases/get-media-master.use-case.js';
import { GetPublicVariantUseCase } from './application/use-cases/get-public-variant.use-case.js';
import { ListMediaUseCase } from './application/use-cases/list-media.use-case.js';
import { PurgeObsoleteMediaUseCase } from './application/use-cases/purge-obsolete-media.use-case.js';
import { UploadMediaUseCase } from './application/use-cases/upload-media.use-case.js';
import { MEDIA_ASSETS_REPOSITORY } from './domain/media-assets.repository.port.js';
import { MediaAdminController } from './infrastructure/http/media-admin.controller.js';
import { MediaPublicController } from './infrastructure/http/media-public.controller.js';
import { MediaLifecycle } from './infrastructure/lifecycle/media-lifecycle.js';
import {
  MediaAssetOrmEntity,
  MediaVariantOrmEntity,
} from './infrastructure/persistence/media.orm-entities.js';
import { TypeOrmMediaAssetsRepository } from './infrastructure/persistence/typeorm-media-assets.repository.js';
import { SharpImageProcessor } from './infrastructure/processing/sharp-image-processor.js';
import { DiskMediaStorage } from './infrastructure/storage/disk-media-storage.js';
import { S3MediaStorage } from './infrastructure/storage/s3-media-storage.js';

const USE_CASES = [
  UploadMediaUseCase,
  ChangeFocalPointUseCase,
  DeleteMediaUseCase,
  ListMediaUseCase,
  GetMediaMasterUseCase,
  GetPublicVariantUseCase,
  PurgeObsoleteMediaUseCase,
  BackfillMissingVariantsUseCase,
];

// El almacenamiento (SeaweedFS o disco) se elige por configuración; el resto no lo sabe.
const createStorage = (): MediaStoragePort => {
  const config = readMediaConfig(envSchema.parse(process.env));
  return config.driver === 's3' ? new S3MediaStorage(config) : new DiskMediaStorage(config.dir);
};

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  imports: [TypeOrmModule.forFeature([MediaAssetOrmEntity, MediaVariantOrmEntity])],
  controllers: [MediaAdminController, MediaPublicController],
  providers: [
    { provide: MEDIA_ASSETS_REPOSITORY, useClass: TypeOrmMediaAssetsRepository },
    { provide: MEDIA_STORAGE, useFactory: createStorage },
    { provide: IMAGE_PROCESSOR, useClass: SharpImageProcessor },
    MediaLifecycle,
    ...USE_CASES,
  ],
  exports: [...USE_CASES, MEDIA_ASSETS_REPOSITORY],
})
export class MediaModule {}
