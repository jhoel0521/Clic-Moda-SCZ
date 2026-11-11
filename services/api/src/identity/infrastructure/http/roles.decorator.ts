import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { RoleValue } from '../../domain/value-objects/role.vo.js';
import { ROLES_KEY } from './roles.constants.js';
import { RolesGuard } from './roles.guard.js';

// Restringe una ruta (o un controlador) a los roles dados. Incluye el guard a propósito: un guard de
// ruta siempre corre DESPUÉS de los globales, es decir, cuando el usuario ya está autenticado.
export const Roles = (...roles: RoleValue[]) =>
  applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard));
