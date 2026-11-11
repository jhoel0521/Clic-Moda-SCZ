import { type CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ForbiddenError,
  UnauthenticatedError,
} from '../../../shared/domain/errors/domain.error.js';
import type { User } from '../../domain/entities/user.entity.js';
import { Role, type RoleValue } from '../../domain/value-objects/role.vo.js';
import { ROLES_KEY } from './roles.constants.js';

// Acepta la petición si AL MENOS UNO de los roles del usuario está permitido en la ruta.
// Corre después del guard global de autenticación, que deja al usuario en request.user.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<RoleValue[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed || allowed.length === 0) return true;

    const user = context.switchToHttp().getRequest<{ user?: User }>().user;
    if (!user) throw new UnauthenticatedError('Se requiere autenticación');
    if (!user.hasAnyRole(allowed.map((value) => Role.of(value)))) {
      throw new ForbiddenError('No tienes permiso para esta acción');
    }
    return true;
  }
}
