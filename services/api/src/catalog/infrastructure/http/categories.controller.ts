import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateCategoryCommand,
  DeleteCategoryCommand,
  UpdateCategoryCommand,
} from '../../application/dtos/category.dtos.js';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case.js';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case.js';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case.js';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import {
  type CategoryRequestDto,
  type CategoryResponseDto,
  categoryRequestSchema,
  toCategoryResponse,
} from './category.dto.js';

// Adaptador de entrada HTTP: solo traduce petición y respuesta; la lógica está en los casos de uso.
@Controller('catalog/categories')
export class CategoriesController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase
  ) {}

  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get()
  async list(): Promise<CategoryResponseDto[]> {
    return (await this.listCategories.execute()).map(toCategoryResponse);
  }

  @Roles('GERENTE')
  @Post()
  async create(
    @Body({ schema: categoryRequestSchema }) body: CategoryRequestDto
  ): Promise<CategoryResponseDto> {
    return toCategoryResponse(
      await this.createCategory.execute(new CreateCategoryCommand(body.name))
    );
  }

  @Roles('GERENTE')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body({ schema: categoryRequestSchema }) body: CategoryRequestDto
  ): Promise<CategoryResponseDto> {
    const result = await this.updateCategory.execute(new UpdateCategoryCommand(id, body.name));
    return toCategoryResponse(result);
  }

  @Roles('GERENTE')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteCategory.execute(new DeleteCategoryCommand(id));
  }
}
