import type { IAuthService } from '@src/core/contracts/IAuthService';
import type { ILoginCredentials, IRegisterData } from '@src/core/models';
import { apiFetch } from './api';

export const AuthService: IAuthService = {
  async login(credentials: ILoginCredentials) {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  async register(data: IRegisterData) {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async logout() {
    // Zustand se encarga de limpiar el estado en el cliente
  },
  async getProfile(userId: string) {
    return apiFetch(`/api/auth/me?userId=${userId}`);
  },
};
