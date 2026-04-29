import type { IAuthService } from '@src/core/contracts/IAuthService';
import type { ILoginCredentials, IRegisterData, IUser } from '@src/core/models';
import { apiFetch } from '@src/services/api';

export const AuthApiService: IAuthService = {
  async login(credentials: ILoginCredentials) {
    return apiFetch<IUser>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  async register(data: IRegisterData) {
    return apiFetch<IUser>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async logout() {
    // Client-side logout
  },
  async getProfile(userId: string) {
    return apiFetch<IUser>(`/api/auth/me?userId=${userId}`);
  },
};
