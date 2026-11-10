import type { IUser, ILoginCredentials, IRegisterData } from '@src/core/models';

export interface IAuthService {
  login(credentials: ILoginCredentials): Promise<IUser>;
  register(data: IRegisterData): Promise<IUser>;
  logout(): Promise<void>;
  getProfile(userId: string): Promise<IUser | null>;
}
