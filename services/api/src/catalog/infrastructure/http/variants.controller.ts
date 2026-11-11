import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  SetVariantActiveCommand,
  UpdateVariantCommand,
} from '../../application/dtos/product.dtos.js';
import { SetVariantActiveUseCase } from '../../application/use-cases/set-variant-active.use-case.js';
import { UpdateVariantUseCase } from '../../application/use-cases/update-variant.use-case.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import {
  type ActiveDto,
  activeSchema,
  type ProductResponseDto,
  toProductResponse,
  type UpdateVariantDto,
  updateVariantSchema,
} from './product.dto.js';

// Las variantes se editan por su propio id; la respuesta es el producto completo ya actualizado.
@Controller('catalog/variants')
export class VariantsController {
  constructor(
    private readonly updateVariant: UpdateVariantUseCase,
    private readonly setVariantActive: SetVariantActiveUseCase
  ) {}

  @Roles('GERENTE')
  @Patch(':variantId')
  async edit(
    @Param('variantId') variantId: string,
    @Body({ schema: updateVariantSchema }) body: UpdateVariantDto
  ): Promise<ProductResponseDto> {
    return toProductResponse(
      await this.updateVariant.execute(new UpdateVariantCommand(variantId, body))
    );
  }

  @Roles('GERENTE')
  @Patch(':variantId/active')
  async activate(
    @Param('variantId') variantId: string,
    @Body({ schema: activeSchema }) body: ActiveDto
  ): Promise<ProductResponseDto> {
    const command = new SetVariantActiveCommand(variantId, body.active);
    return toProductResponse(await this.setVariantActive.execute(command));
  }
}
