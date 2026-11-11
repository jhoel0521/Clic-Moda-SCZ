import type { User } from '../../domain/entities/user.entity.js';

// DTO de respuesta del perfil del usuario autenticado. Sin contraseña ni hash.
export interface CurrentStaffDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export const toCurrentStaff = (user: User): CurrentStaffDto => ({
  id: user.id.value,
  email: user.email.value,
  name: user.name.value,
  roles: user.roles.map((role) => role.value),
});
