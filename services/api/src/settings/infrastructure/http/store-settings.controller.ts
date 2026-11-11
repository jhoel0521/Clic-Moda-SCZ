import { Public } from '@nestjs/authentication';
import { Body, Controller, Get, Put, Req, Res } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import type { SettingsResult } from '../../application/dtos/settings.dtos.js';
import { GetPublicSettingsUseCase } from '../../application/use-cases/get-public-settings.use-case.js';
import { UpdateSettingsUseCase } from '../../application/use-cases/update-settings.use-case.js';
import { type UpdateSettingsDto, toUpdateCommand, updateSettingsSchema } from './settings.dto.js';

// 15 s en cada capa (aquí y en la tienda): un cambio guardado llega a todos en 30 s como máximo.
const CACHE_CONTROL = 'public, max-age=15';

// ETag fuerte: huella del cuerpo exacto que se envía.
const etagOf = (body: string): string => `"${createHash('sha1').update(body).digest('hex')}"`;

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
    const body = JSON.stringify(await this.getSettings.execute());
    const etag = etagOf(body);
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    res.type('application/json').send(body);
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
