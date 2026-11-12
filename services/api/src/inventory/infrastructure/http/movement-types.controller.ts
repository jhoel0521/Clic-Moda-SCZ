import { CurrentUser } from '@nestjs/authentication';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '../../../identity/domain/entities/user.entity.js';
import { Role } from '../../../identity/domain/value-objects/role.vo.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import { ForbiddenError } from '../../../shared/domain/errors/domain.error.js';
import {
  CreateMovementTypeCommand,
  ListMovementTypesQuery,
  type MovementTypeResult,
  RenameMovementTypeCommand,
  SetMovementTypeActiveCommand,
} from '../../application/dtos/movement-type.dtos.js';
import { CreateMovementTypeUseCase } from '../../application/use-cases/create-movement-type.use-case.js';
import { ListMovementTypesUseCase } from '../../application/use-cases/list-movement-types.use-case.js';
import { RenameMovementTypeUseCase } from '../../application/use-cases/rename-movement-type.use-case.js';
import { SetMovementTypeActiveUseCase } from '../../application/use-cases/set-movement-type-active.use-case.js';
import {
  type CreateTypeDto,
  createTypeSchema,
  type ListTypesQueryDto,
  listTypesQuerySchema,
  type PatchTypeDto,
  patchTypeSchema,
} from './movement-type.dto.js';

const ALL = ['GERENTE', 'DESPACHO', 'ATENCION'] as const;

// Tipos de movimiento: todo el personal lee los activos; solo el Gerente crea, renombra, activa y desactiva.
@Controller('inventory/movement-types')
export class MovementTypesController {
  constructor(
    private readonly list: ListMovementTypesUseCase,
    private readonly create: CreateMovementTypeUseCase,
    private readonly rename: RenameMovementTypeUseCase,
    private readonly setActive: SetMovementTypeActiveUseCase
  ) {}

  @Roles(...ALL)
  @Get()
  index(
    @Query({ schema: listTypesQuerySchema }) query: ListTypesQueryDto,
    @CurrentUser() user: User
  ): Promise<MovementTypeResult[]> {
    const wantsAll = query.includeInactive === true;
    if (wantsAll && !user.hasAnyRole([Role.of('GERENTE')])) {
      throw new ForbiddenError('Solo el Gerente ve los tipos desactivados');
    }
    return this.list.execute(new ListMovementTypesQuery(wantsAll));
  }

  @Roles('GERENTE')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  store(@Body({ schema: createTypeSchema }) body: CreateTypeDto): Promise<MovementTypeResult> {
    return this.create.execute(new CreateMovementTypeCommand(body.name, body.kind));
  }

  @Roles('GERENTE')
  @Patch(':code')
  async update(
    @Param('code') code: string,
    @Body({ schema: patchTypeSchema }) body: PatchTypeDto
  ): Promise<MovementTypeResult> {
    let result: MovementTypeResult | null = null;
    if (body.name !== undefined) {
      result = await this.rename.execute(new RenameMovementTypeCommand(code, body.name));
    }
    if (body.active !== undefined) {
      result = await this.setActive.execute(new SetMovementTypeActiveCommand(code, body.active));
    }
    return result as MovementTypeResult;
  }
}
