import { Public } from '@nestjs/authentication';
import { Body, Controller, Get, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { sendCacheableJson } from '../../../shared/infrastructure/http/cacheable-json.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import type { SettingsResult } from '../../application/dtos/settings.dtos.js';
import { GetPublicSettingsUseCase } from '../../application/use-cases/get-public-settings.use-case.js';
import { UpdateSettingsUseCase } from '../../application/use-cases/update-settings.use-case.js';
import { type UpdateSettingsDto, toUpdateCommand, updateSettingsSchema } from './settings.dto.js';

@Controller('store-settings')
export class StoreSettingsController {
  constructor(
    private readonly getSettings: GetPublicSettingsUseCase,
    private readonly updateSettings: UpdateSettingsUseCase
  ) {}

  // Lectura abierta a cualquier visitante: solo marca, contacto y redes.
  @Public()
  @Get()
  async read(@Req() req: Request, @Res() res: Response): Promise<void> {
    sendCacheableJson(req, res, await this.getSettings.execute());
  }

  // Solo el Gerente guarda. Reemplaza todo el contenido; errores por campo con HTTP 422.
  @Roles('GERENTE')
  @Put()
  async replace(
    @Body({ schema: updateSettingsSchema }) dto: UpdateSettingsDto
  ): Promise<SettingsResult> {
    return this.updateSettings.execute(toUpdateCommand(dto));
  }
}
