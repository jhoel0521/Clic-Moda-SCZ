import { delay } from '@src/mocks/utils/delay';
import usersData from '@src/mocks/data/users.json';
import type { IUser, ILoginCredentials, IRegisterData } from '@src/core/models';
import { ROLES } from '@src/core/constants/ROLES';

// Simulación de la DB de usuarios en memoria
interface MockUserRecord extends IUser {
  password: string;
}

const mockUsersDB: MockUserRecord[] = usersData as MockUserRecord[];

// Contador de IDs para nuevos usuarios
let userIdCounter = mockUsersDB.length + 1;

export class MockAuthError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'NOT_FOUND' | 'UNAUTHORIZED',
  ) {
    super(message);
    this.name = 'MockAuthError';
  }
}

export const MockAuthService = {
  /**
   * Simula el inicio de sesión.
   * @throws MockAuthError si las credenciales son inválidas.
   */
  async login(credentials: ILoginCredentials): Promise<IUser> {
    await delay();

    const found = mockUsersDB.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password,
    );

    if (!found) {
      throw new MockAuthError(
        'Email o contraseña incorrectos.',
        'INVALID_CREDENTIALS',
      );
    }

    // Retornamos el usuario sin la contraseña
    const { password: _password, ...user } = found;
    void _password;
    return user as IUser;
  },

  /**
   * Simula el registro de un nuevo usuario cliente.
   * @throws MockAuthError si el email ya está registrado.
   */
  async register(data: IRegisterData): Promise<IUser> {
    await delay();

    const emailTaken = mockUsersDB.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase(),
    );

    if (emailTaken) {
      throw new MockAuthError(
        'Este email ya está registrado. ¿Querés iniciar sesión?',
        'EMAIL_TAKEN',
      );
    }

    const newUser: MockUserRecord = {
      id: `usr_${String(++userIdCounter).padStart(3, '0')}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: ROLES.CLIENTE,
      phone: data.phone,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString(),
    };

    mockUsersDB.push(newUser);

    const { password: _password, ...user } = newUser;
    void _password;
    return user as IUser;
  },

  /**
   * Simula el logout (sin operación necesaria en mock).
   */
  async logout(): Promise<void> {
    await delay(100, 200);
  },

  /**
   * Obtiene el perfil del usuario por ID.
   */
  async getProfile(userId: string): Promise<IUser> {
    await delay();

    const found = mockUsersDB.find((u) => u.id === userId);
    if (!found) {
      throw new MockAuthError('Usuario no encontrado.', 'NOT_FOUND');
    }

    const { password: _password, ...user } = found;
    void _password;
    return user as IUser;
  },
};
