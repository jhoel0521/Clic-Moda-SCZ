import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.error.js';
import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { FakePasswordHasher } from '../../testing/fake-password-hasher.js';
import { InMemoryUsersRepository } from '../../testing/in-memory-users.repository.js';
import { ResetPasswordCommand, ResetPasswordUseCase } from './reset-password.use-case.js';

async function setup() {
  const users = new InMemoryUsersRepository();
  const hasher = new FakePasswordHasher();
  await users.save(User.create({ email: Email.of('ana@tienda.com'), name: PersonName.of('Ana') }));
  return { users, hasher, useCase: new ResetPasswordUseCase(users, hasher) };
}

describe('ResetPasswordUseCase', () => {
  it('guarda el hash de la contraseña nueva, nunca la contraseña en claro', async () => {
    const { users, useCase } = await setup();
    const result = await useCase.execute(
      new ResetPasswordCommand('ANA@tienda.com', 'passwordTemporal123@')
    );

    expect(result.email).toBe('ana@tienda.com');
    expect((await users.findByEmail(Email.of('ana@tienda.com')))?.passwordHash?.value).toBe(
      'fake:passwordTemporal123@'
    );
  });

  it('rechaza una contraseña de menos de 12 caracteres sin hashear ni guardar', async () => {
    const { hasher, useCase } = await setup();

    await expect(
      useCase.execute(new ResetPasswordCommand('ana@tienda.com', 'corta-123'))
    ).rejects.toThrow(ValidationError);
    expect(hasher.hashCalls).toEqual([]);
  });

  it('falla si el correo no pertenece a ningún usuario', async () => {
    const { useCase } = await setup();

    await expect(
      useCase.execute(new ResetPasswordCommand('nadie@tienda.com', 'passwordTemporal123@'))
    ).rejects.toThrow(NotFoundError);
  });
});
