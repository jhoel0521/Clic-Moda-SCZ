import { Public } from '@nestjs/authentication';
import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { sendCacheableJson } from '../../../shared/infrastructure/http/cacheable-json.js';
import { GetPublicProductQuery } from '../../application/dtos/public-catalog.dtos.js';
import { GetPublicProductUseCase } from '../../application/use-cases/get-public-product.use-case.js';
import { ListPublicCatalogUseCase } from '../../application/use-cases/list-public-catalog.use-case.js';
import { ListPublicFiltersUseCase } from '../../application/use-cases/list-public-filters.use-case.js';
import { ListPublishedSlugsUseCase } from '../../application/use-cases/list-published-slugs.use-case.js';
import { type PublicListDto, publicListSchema, toListQuery } from './public-catalog.dto.js';

// Catálogo para el público, sin sesión: solo lo vendible y nunca datos internos. Cada respuesta lleva
// `ETag` y una caché de 15 s (304 si no cambió).
@Controller('public/catalog')
export class PublicCatalogController {
  constructor(
    private readonly list: ListPublicCatalogUseCase,
    private readonly detail: GetPublicProductUseCase,
    private readonly filters: ListPublicFiltersUseCase,
    private readonly slugs: ListPublishedSlugsUseCase
  ) {}

  @Public()
  @Get()
  async products(
    @Query({ schema: publicListSchema }) query: PublicListDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    sendCacheableJson(req, res, await this.list.execute(toListQuery(query)));
  }

  @Public()
  @Get('filters')
  async filterOptions(@Req() req: Request, @Res() res: Response): Promise<void> {
    sendCacheableJson(req, res, await this.filters.execute());
  }

  @Public()
  @Get('slugs')
  async publishedSlugs(@Req() req: Request, @Res() res: Response): Promise<void> {
    sendCacheableJson(req, res, await this.slugs.execute());
  }

  @Public()
  @Get('products/:slug')
  async product(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    sendCacheableJson(req, res, await this.detail.execute(new GetPublicProductQuery(slug)));
  }
}
