import { Email } from '../value-objects/email.vo.js';
import { PersonName } from '../value-objects/person-name.vo.js';
import { Role } from '../value-objects/role.vo.js';
import { User } from './user.entity.js';

const newUser = () =>
  User.create({ email: Email.of('ana@correo.com'), name: PersonName.of('Ana') });

describe('User: creación', () => {
  it('nace sin roles, sin correo verificado y sin contraseña', () => {
    const user = newUser();

    expect([user.roles.length, user.emailVerified, user.passwordHash]).toEqual([0, false, null]);
  });

  it('cada usuario creado recibe un identificador distinto', () => {
    expect(newUser().equals(newUser())).toBe(false);
  });

  it('se identifica por su id: rehidratar el mismo id da una entidad igual', () => {
    const user = newUser();
    const same = User.rehydrate({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: false,
      passwordHash: null,
      roles: [],
    });

    expect(same.equals(user)).toBe(true);
  });
});

describe('User: roles', () => {
  it('puede tener varios roles a la vez', () => {
    const user = newUser();
    user.assignRoles([Role.DESPACHO, Role.ATENCION]);

    expect([user.hasRole(Role.DESPACHO), user.hasRole(Role.ATENCION)]).toEqual([true, true]);
    expect(user.hasRole(Role.GERENTE)).toBe(false);
  });

  it('asignar reemplaza el conjunto completo de roles', () => {
    const user = newUser();
    user.assignRoles([Role.GERENTE, Role.DESPACHO]);
    user.assignRoles([Role.ATENCION]);

    expect(user.roles.map((role) => role.value)).toEqual(['ATENCION']);
  });

  it('descarta los roles duplicados', () => {
    const user = newUser();
    user.assignRoles([Role.GERENTE, Role.of('gerente'), Role.GERENTE]);

    expect(user.roles).toHaveLength(1);
  });
});

describe('User: permisos por rol', () => {
  it('hasAnyRole acepta si al menos uno de sus roles está permitido', () => {
    const user = newUser();
    user.assignRoles([Role.DESPACHO, Role.ATENCION]);

    expect([
      user.hasAnyRole([Role.GERENTE, Role.DESPACHO]),
      user.hasAnyRole([Role.GERENTE]),
    ]).toEqual([true, false]);
  });
});
