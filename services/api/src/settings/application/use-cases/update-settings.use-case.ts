import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import { StoreSettings } from '../../domain/entities/store-settings.entity.js';
import {
  STORE_SETTINGS_REPOSITORY,
  type StoreSettingsRepository,
} from '../../domain/store-settings.repository.port.js';
import type { SettingsResult, UpdateSettingsCommand } from '../dtos/settings.dtos.js';
import { MEDIA_REFERENCES, type MediaReferencesPort } from '../ports/media-references.port.js';
import { buildChanges, IssueCollector } from '../support/build-changes.js';
import { toSettingsResult } from '../support/to-settings-result.js';

// Reemplaza TODA la configuración. Valida cada campo y devuelve todos los errores juntos (HTTP 422).
@Injectable()
export class UpdateSettingsUseCase implements UseCase<UpdateSettingsCommand, SettingsResult> {
  constructor(
    @Inject(STORE_SETTINGS_REPOSITORY) private readonly settings: StoreSettingsRepository,
    @Inject(MEDIA_REFERENCES) private readonly media: MediaReferencesPort
  ) {}

  async execute(command: UpdateSettingsCommand): Promise<SettingsResult> {
    const collect = new IssueCollector();
    const changes = buildChanges(command, collect);
    await this.checkImages(command, collect);
    if (!changes || collect.issues.length) throw new FieldValidationError(collect.issues);
    const next = (await this.settings.find()) ?? StoreSettings.seed();
    const updated = next.replaceWith(changes);
    await this.settings.save(updated);
    return toSettingsResult(updated, this.media);
  }

  // Una imagen que no existe o no está publicada no se puede elegir como logo ni como imagen de compartir.
  private async checkImages(
    command: UpdateSettingsCommand,
    collect: IssueCollector
  ): Promise<void> {
    const picks = [
      ['logo', command.logoMediaId],
      ['shareImage', command.shareMediaId],
    ] as const;
    for (const [field, id] of picks) {
      if (!id || collect.issues.some((issue) => issue.field === field)) continue;
      if (!(await this.media.find(id)))
        collect.issues.push({ field, message: 'La imagen elegida no existe o no está publicada' });
    }
  }
}
