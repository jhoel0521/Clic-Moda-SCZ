import { Public } from '@nestjs/authentication';
import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PublicVariantQuery } from '../../application/dtos/media.dtos.js';
import { GetPublicVariantUseCase } from '../../application/use-cases/get-public-variant.use-case.js';
import { MediaNotFoundError } from '../../domain/errors/media.errors.js';
import { PUBLIC_FILE } from './media.dto.js';

const IMMUTABLE = 'public, max-age=31536000, immutable';

// Entrega pública de las variantes publicadas. La tienda reenvía aquí sus rutas /m/*.
// Una revisión publicada nunca cambia: caché inmutable y ETag estable (304 ante If-None-Match).
@Controller('public/media')
export class MediaPublicController {
  constructor(private readonly getVariant: GetPublicVariantUseCase) {}

  @Public()
  @Get(':id/:file')
  async serve(
    @Param('id') id: string,
    @Param('file') file: string,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const match = PUBLIC_FILE.exec(file);
    if (!match) throw new MediaNotFoundError();
    const [, format = '', revision = '0', extension = ''] = match;
    const variant = await this.getVariant.execute(
      new PublicVariantQuery(id, format, Number(revision), extension)
    );
    res.setHeader('Cache-Control', IMMUTABLE);
    res.setHeader('ETag', variant.etag);
    if (req.headers['if-none-match'] === variant.etag) {
      res.status(304).end();
      return;
    }
    res.setHeader('Content-Type', variant.contentType);
    res.send(variant.body);
  }
}
