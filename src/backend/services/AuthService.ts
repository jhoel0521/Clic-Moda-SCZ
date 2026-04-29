import type { IAuthService } from '@src/core/contracts/IAuthService';
import type { IUser, ILoginCredentials, IRegisterData } from '@src/core/models';
import { ROLES } from '@src/core/constants/ROLES';
import { hashPassword, verifyPassword } from '../db/crypto';
import { findAll, insert, findById, FullDatabase, IUserWithPassword } from '../db/db';
import crypto from 'crypto';

export const AuthService: IAuthService = {
  async login(credentials: ILoginCredentials): Promise<IUser> {
    const users = findAll('users');
    const found = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!found || !verifyPassword(credentials.password, found.password)) {
      throw new Error('Email o contraseña incorrectos.');
    }

    const { password: _password, ...user } = found;
    return user as IUser;
  },

  async register(data: IRegisterData): Promise<IUser> {
    const users = findAll('users');
    const emailTaken = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());

    if (emailTaken) {
      throw new Error('Este email ya está registrado.');
    }

    const newUser: IUserWithPassword = {
      id: `usr_${crypto.randomUUID().substring(0, 8)}`,
      name: data.name,
      email: data.email,
      password: hashPassword(data.password),
      role: ROLES.CLIENTE,
      phone: data.phone,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString(),
    };

    insert('users', newUser);

    const { password: _password, ...user } = newUser;
    return user as IUser;
  },

  async logout(): Promise<void> {
    // No operation needed on server side for this simple implementation
  },

  async getProfile(userId: string): Promise<IUser | null> {
    const found = findById<IUserWithPassword>('users', userId);
    if (!found) return null;

    const { password: _password, ...user } = found;
    return user as IUser;
  },
};
