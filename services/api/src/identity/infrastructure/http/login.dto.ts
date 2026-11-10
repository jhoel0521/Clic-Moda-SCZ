import { z } from 'zod';
import type { AuthenticateStaffResult } from '../../application/dtos/authenticate-staff.result.js';

// DTO de petición HTTP: único lugar donde se valida el formato de transporte.
export const loginRequestSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(1024),
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

// DTO de respuesta HTTP. Nunca contiene contraseña ni hash.
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number;
  user: { id: string; email: string; name: string; roles: string[] };
}

// Mapper aplicación -> HTTP.
export const toLoginResponse = (result: AuthenticateStaffResult): LoginResponseDto => ({
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,
  expiresInSeconds: result.expiresInSeconds,
  user: { ...result.user, roles: [...result.user.roles] },
});
