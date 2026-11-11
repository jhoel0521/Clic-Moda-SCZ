import {
  InvalidEmailError,
  InvalidPasswordHashError,
  InvalidPersonNameError,
  InvalidRoleError,
  InvalidUserIdError,
} from '../errors/invalid-value.errors.js';
import { Email } from './email.vo.js';
import { PasswordHash } from './password-hash.vo.js';
import { PersonName } from './person-name.vo.js';
import { Role } from './role.vo.js';
import { UserId } from './user-id.vo.js';

describe('Email', () => {
  it('se normaliza: sin espacios y en minúsculas', () => {
    expect(Email.of('  Ana@Correo.COM ').value).toBe('ana@correo.com');
  });

  it('dos correos que solo difieren en mayúsculas son iguales por valor', () => {
    expect(Email.of('ANA@correo.com').equals(Email.of('ana@correo.com'))).toBe(true);
  });

  it.each(['', 'sin-arroba', 'a@b', 'a b@c.com', `${'x'.repeat(250)}@c.com`])(
    'rechaza el correo inválido "%s"',
    (raw) => {
      expect(() => Email.of(raw)).toThrow(InvalidEmailError);
    }
  );
});

describe('Role', () => {
  it('acepta un rol válido sin importar mayúsculas ni espacios', () => {
    expect(Role.of(' gerente ').equals(Role.GERENTE)).toBe(true);
  });

  it('rechaza un rol desconocido', () => {
    expect(() => Role.of('ADMIN')).toThrow(InvalidRoleError);
  });

  it('all() lista los tres roles', () => {
    expect(Role.all().map((role) => role.value)).toEqual(['GERENTE', 'DESPACHO', 'ATENCION']);
  });
});

describe('UserId', () => {
  it('generate crea identificadores distintos y válidos', () => {
    const [a, b] = [UserId.generate(), UserId.generate()];

    expect([a.equals(b), UserId.of(a.value).equals(a)]).toEqual([false, true]);
  });

  it.each(['', '123', 'no-es-un-uuid'])('rechaza el identificador inválido "%s"', (raw) => {
    expect(() => UserId.of(raw)).toThrow(InvalidUserIdError);
  });
});

describe('PersonName', () => {
  it('recorta y colapsa los espacios', () => {
    expect(PersonName.of('  Ana   María  Pérez ').value).toBe('Ana María Pérez');
  });

  it.each(['', '   ', 'x'.repeat(101)])('rechaza el nombre inválido (largo %#)', (raw) => {
    expect(() => PersonName.of(raw)).toThrow(InvalidPersonNameError);
  });
});

describe('PasswordHash', () => {
  it('rechaza un hash vacío', () => {
    expect(() => PasswordHash.of('')).toThrow(InvalidPasswordHashError);
  });

  it('no se filtra al serializarlo ni al convertirlo en texto', () => {
    const hash = PasswordHash.of('scrypt$secreto');

    expect(JSON.stringify({ hash })).not.toContain('secreto');
    expect(`${hash}`).not.toContain('secreto');
  });
});
