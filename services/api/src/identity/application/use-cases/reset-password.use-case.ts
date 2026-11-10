import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.error.js';
import { USERS_REPOSITORY, type UsersRepository } from '../../domain/users.repository.port.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PASSWORD_HASHER, type PasswordHasherPort } from '../ports/password-hasher.port.js';

export const MIN_PASSWORD_LENGTH = 12;

export class ResetPasswordCommand {
  constructor(
    readonly email: string,
    readonly newPassword: string
  ) {}
}

export interface ResetPasswordResult {
  readonly email: string;
}

// Fija una contraseña nueva para un usuario del personal. Lo ejecuta quien administra el servidor
// (CLI); no es una ruta HTTP. La contraseña nunca se guarda en claro.
@Injectable()
export class ResetPasswordUseCase implements UseCase<ResetPasswordCommand, ResetPasswordResult> {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    if (command.newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      );
    }
    const user = await this.users.findByEmail(Email.of(command.email));
    if (!user) throw new NotFoundError('No existe un usuario con ese correo');
    user.changePasswordHash(await this.hasher.hash(command.newPassword));
    await this.users.save(user);
    return { email: user.email.value };
  }
}
