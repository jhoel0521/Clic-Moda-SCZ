import type { UserRole } from '@src/core/constants/ROLES';

/** Imagen de un producto */
export interface IImage {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
}

/** Usuario del sistema */
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

/** Credenciales de inicio de sesión */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/** Datos para registrar un nuevo usuario cliente */
export interface IRegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
