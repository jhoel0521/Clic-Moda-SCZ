import { UnauthenticatedError } from '../../../shared/domain/errors/domain.error.js';
import { User } from '../../domain/entities/user.entity.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { FakeAccessTokenIssuer } from '../../testing/fake-access-token-issuer.js';
import { FakePasswordHasher } from '../../testing/fake-password-hasher.js';
import { InMemoryUsersRepository } from '../../testing/in-memory-users.repository.js';
import { AuthenticateStaffCommand } from '../dtos/authenticate-staff.command.js';
import {
  AuthenticateStaffUseCase,
  STAFF_SESSION_MAX_SECONDS,
} from './authenticate-staff.use-case.js';

const PASSWORD = 'clave-segura-123';

async function setup(lifetimeSeconds?: number) {
  const [users, hasher, issuer] = [
    new InMemoryUsersRepository(),
    new FakePasswordHasher(),
    new FakeAccessTokenIssuer(lifetimeSeconds),
  ];
  const ana = User.create({
    email: Email.of('ana@correo.com'),
    name: PersonName.of('Ana Pérez'),
    passwordHash: await hasher.hash(PASSWORD),
  });
  ana.assignRoles([Role.DESPACHO, Role.ATENCION]);
  await users.save(ana);
  return {
    ana,
    users,
    hasher,
    issuer,
    useCase: new AuthenticateStaffUseCase(users, hasher, issuer),
  };
}

const login = (email: string, password: string) => new AuthenticateStaffCommand(email, password);

describe('AuthenticateStaffUseCase: acceso correcto', () => {
  it('devuelve credenciales con todos los roles del usuario', async () => {
    const { useCase } = await setup();
    const result = await useCase.execute(login('ana@correo.com', PASSWORD));

    expect(result.user.roles).toEqual(['DESPACHO', 'ATENCION']);
    expect(result.user.email).toBe('ana@correo.com');
  });

  it('pide al emisor el techo de 8 horas y la vigencia no lo supera', async () => {
    const { useCase, issuer } = await setup();
    const result = await useCase.execute(login('ANA@correo.com', PASSWORD));

    expect(issuer.calls[0].maxLifetimeSeconds).toBe(8 * 60 * 60);
    expect(result.expiresInSeconds).toBeLessThanOrEqual(STAFF_SESSION_MAX_SECONDS);
  });

  it('el resultado no contiene la contraseña ni el hash', async () => {
    const { useCase } = await setup();
    const result = await useCase.execute(login('ana@correo.com', PASSWORD));

    expect(JSON.stringify(result)).not.toMatch(/fake:|clave-segura/);
  });
});

describe('AuthenticateStaffUseCase: rechazo', () => {
  it.each([
    ['contraseña errónea', 'ana@correo.com', 'otra-clave'],
    ['correo desconocido', 'nadie@correo.com', PASSWORD],
    ['correo mal formado', 'esto-no-es-un-correo', PASSWORD],
  ])('%s: lanza el mismo InvalidCredentialsError', async (_caso, email, password) => {
    const { useCase, issuer } = await setup();

    await expect(useCase.execute(login(email, password))).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
    expect(issuer.calls).toHaveLength(0);
  });
});

describe('AuthenticateStaffUseCase: el error no filtra información', () => {
  it('el mensaje es idéntico para correo desconocido y contraseña errónea', async () => {
    const { useCase } = await setup();
    const messages = await Promise.all(
      [login('ana@correo.com', 'mala'), login('nadie@correo.com', 'mala')].map((command) =>
        useCase.execute(command).catch((error: Error) => error.message)
      )
    );

    expect(new Set(messages).size).toBe(1);
  });

  it('es un error de autenticación (UnauthenticatedError)', async () => {
    const { useCase } = await setup();

    await expect(useCase.execute(login('nadie@correo.com', 'x'))).rejects.toBeInstanceOf(
      UnauthenticatedError
    );
  });
});

describe('AuthenticateStaffUseCase: cuentas sin acceso de personal', () => {
  it('un usuario sin contraseña no puede entrar', async () => {
    const { useCase, users } = await setup();
    await users.save(User.create({ email: Email.of('sin@clave.com'), name: PersonName.of('Sin') }));

    await expect(useCase.execute(login('sin@clave.com', PASSWORD))).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
  });

  it('un usuario sin roles no es personal y no puede entrar', async () => {
    const { useCase, users, hasher } = await setup();
    const cliente = User.create({
      email: Email.of('cliente@correo.com'),
      name: PersonName.of('Cliente'),
      passwordHash: await hasher.hash(PASSWORD),
    });
    await users.save(cliente);

    await expect(useCase.execute(login('cliente@correo.com', PASSWORD))).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
  });
});

describe('AuthenticateStaffUseCase: tiempos y techo', () => {
  it('verifica una contraseña también cuando el usuario no existe (igual coste)', async () => {
    const { useCase, hasher } = await setup();
    await useCase.execute(login('nadie@correo.com', 'x')).catch(() => undefined);

    expect(hasher.verifyCalls).toEqual(['x']);
  });

  it('falla si el emisor de tokens supera el techo de 8 horas', async () => {
    const { useCase } = await setup(STAFF_SESSION_MAX_SECONDS + 1);

    await expect(useCase.execute(login('ana@correo.com', PASSWORD))).rejects.toThrow(/techo/);
  });
});
