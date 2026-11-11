import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { StoreSettings } from '../../domain/entities/store-settings.entity.js';
import {
  STORE_SETTINGS_REPOSITORY,
  type StoreSettingsRepository,
} from '../../domain/store-settings.repository.port.js';
import type { SettingsResult } from '../dtos/settings.dtos.js';
import { MEDIA_REFERENCES, type MediaReferencesPort } from '../ports/media-references.port.js';
import { toSettingsResult } from '../support/to-settings-result.js';

// Fecha fija de la semilla: así el ETag no cambia en cada lectura mientras no se guarde nada.
const SEED_DATE = new Date(0);

// Lo que ve cualquier visitante: marca, color, contacto y redes. Nunca datos de pago ni privados.
@Injectable()
export class GetPublicSettingsUseCase implements UseCase<void, SettingsResult> {
  constructor(
    @Inject(STORE_SETTINGS_REPOSITORY) private readonly settings: StoreSettingsRepository,
    @Inject(MEDIA_REFERENCES) private readonly media: MediaReferencesPort
  ) {}

  async execute(): Promise<SettingsResult> {
    const saved = (await this.settings.find()) ?? StoreSettings.seed(SEED_DATE);
    return toSettingsResult(saved, this.media);
  }
}
