import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from '../media/media.module.js';
import { MEDIA_REFERENCES } from './application/ports/media-references.port.js';
import { GetPublicSettingsUseCase } from './application/use-cases/get-public-settings.use-case.js';
import { UpdateSettingsUseCase } from './application/use-cases/update-settings.use-case.js';
import { STORE_SETTINGS_REPOSITORY } from './domain/store-settings.repository.port.js';
import { StoreSettingsController } from './infrastructure/http/store-settings.controller.js';
import { MediaReferencesAdapter } from './infrastructure/media/media-references.adapter.js';
import { StoreSettingsOrmEntity } from './infrastructure/persistence/store-settings.orm-entities.js';
import { TypeOrmStoreSettingsRepository } from './infrastructure/persistence/typeorm-store-settings.repository.js';

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  imports: [TypeOrmModule.forFeature([StoreSettingsOrmEntity]), MediaModule],
  controllers: [StoreSettingsController],
  providers: [
    { provide: STORE_SETTINGS_REPOSITORY, useClass: TypeOrmStoreSettingsRepository },
    { provide: MEDIA_REFERENCES, useClass: MediaReferencesAdapter },
    GetPublicSettingsUseCase,
    UpdateSettingsUseCase,
  ],
  exports: [STORE_SETTINGS_REPOSITORY, GetPublicSettingsUseCase],
})
export class SettingsModule {}
