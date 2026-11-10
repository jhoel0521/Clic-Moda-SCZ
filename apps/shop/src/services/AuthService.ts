import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { IAuthService } from '@src/core/contracts/IAuthService';
import type { ILoginCredentials, IRegisterData } from '@src/core/models';

export const AuthService: IAuthService = {
  async login(credentials: ILoginCredentials) {
    const service = await ServiceFactory.getAuthService();
    return service.login(credentials);
  },
  async register(data: IRegisterData) {
    const service = await ServiceFactory.getAuthService();
    return service.register(data);
  },
  async logout() {
    const service = await ServiceFactory.getAuthService();
    return service.logout();
  },
  async getProfile(userId: string) {
    const service = await ServiceFactory.getAuthService();
    return service.getProfile(userId);
  },
};
