import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import {
  AddVariantCommand,
  GetProductQuery,
  RegisterProductCommand,
  SearchProductsQuery,
  SetProductActiveCommand,
  SetProductPhotosCommand,
  UpdateProductCommand,
} from '../../application/dtos/product.dtos.js';
import { AddVariantUseCase } from '../../application/use-cases/add-variant.use-case.js';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case.js';
import { RegisterProductUseCase } from '../../application/use-cases/register-product.use-case.js';
import { SearchProductsUseCase } from '../../application/use-cases/search-products.use-case.js';
import { SetProductPhotosUseCase } from '../../application/use-cases/set-product-photos.use-case.js';
import { SetProductActiveUseCase } from '../../application/use-cases/set-product-active.use-case.js';
import {
  SetProductPriceCommand,
  SetProductPriceUseCase,
} from '../../application/use-cases/set-product-price.use-case.js';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import {
  type ActiveDto,
  activeSchema,
  type PriceDto,
  priceSchema,
  type PhotosDto,
  photosSchema,
  type ProductPageResponseDto,
  type ProductResponseDto,
  type RegisterProductDto,
  registerProductSchema,
  type SearchProductsDto,
  searchProductsSchema,
  toProductPageResponse,
  toProductResponse,
  type UpdateProductDto,
  updateProductSchema,
  type VariantRequestDto,
  variantRequestSchema,
} from './product.dto.js';

@Controller('catalog/products')
export class ProductsController {
  constructor(
    private readonly register: RegisterProductUseCase,
    private readonly update: UpdateProductUseCase,
    private readonly setActive: SetProductActiveUseCase,
    private readonly setPrice: SetProductPriceUseCase,
    private readonly addVariant: AddVariantUseCase,
    private readonly search: SearchProductsUseCase,
    private readonly get: GetProductUseCase,
    private readonly setPhotos: SetProductPhotosUseCase
  ) {}

  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get()
  async list(
    @Query({ schema: searchProductsSchema }) query: SearchProductsDto
  ): Promise<ProductPageResponseDto> {
    const { page, pageSize, text, categoryId, active, stock } = query;
    const found = await this.search.execute(
      new SearchProductsQuery(page, pageSize, text, categoryId, active, stock)
    );
    return toProductPageResponse(found);
  }

  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get(':id')
  async detail(@Param('id') id: string): Promise<ProductResponseDto> {
    return toProductResponse(await this.get.execute(new GetProductQuery(id)));
  }

  @Roles('GERENTE')
  @Post()
  async create(
    @Body({ schema: registerProductSchema }) body: RegisterProductDto
  ): Promise<ProductResponseDto> {
    const command = new RegisterProductCommand(
      body.categoryId,
      body.name,
      body.description,
      body.variants
    );
    return toProductResponse(await this.register.execute(command));
  }

  @Roles('GERENTE')
  @Patch(':id')
  async edit(
    @Param('id') id: string,
    @Body({ schema: updateProductSchema }) body: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return toProductResponse(await this.update.execute(new UpdateProductCommand(id, body)));
  }

  @Roles('GERENTE')
  @Patch(':id/active')
  async activate(
    @Param('id') id: string,
    @Body({ schema: activeSchema }) body: ActiveDto
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setActive.execute(new SetProductActiveCommand(id, body.active))
    );
  }

  // Reemplaza todas las fotos del producto (la primera es la principal). Solo el Gerente.
  @Roles('GERENTE')
  @Put(':id/photos')
  async photos(
    @Param('id') id: string,
    @Body({ schema: photosSchema }) body: PhotosDto
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setPhotos.execute(new SetProductPhotosCommand(id, body.mediaIds))
    );
  }

  // Un solo precio por modelo: se aplica a todas sus variantes a la vez.
  @Roles('GERENTE')
  @Patch(':id/price')
  async price(
    @Param('id') id: string,
    @Body({ schema: priceSchema }) body: PriceDto
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.setPrice.execute(new SetProductPriceCommand(id, body.price))
    );
  }

  @Roles('GERENTE')
  @Post(':id/variants')
  async newVariant(
    @Param('id') id: string,
    @Body({ schema: variantRequestSchema }) body: VariantRequestDto
  ): Promise<ProductResponseDto> {
    return toProductResponse(await this.addVariant.execute(new AddVariantCommand(id, body)));
  }
}
