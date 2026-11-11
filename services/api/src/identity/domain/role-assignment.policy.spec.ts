import { ConflictError } from '../../shared/domain/errors/domain.error.js';
import { LastManagerError } from './errors/last-manager.error.js';
import { assertManagerContinuity } from './role-assignment.policy.js';
import { Role } from './value-objects/role.vo.js';

describe('assertManagerContinuity: lo que se rechaza', () => {
  it('rechaza quitar el rol de Gerente al único Gerente', () => {
    expect(() =>
      assertManagerContinuity({
        previousRoles: [Role.GERENTE, Role.DESPACHO],
        newRoles: [Role.DESPACHO],
        managerCount: 1,
      })
    ).toThrow(LastManagerError);
  });

  it('el error es un ConflictError con un mensaje que explica el motivo', () => {
    const error = new LastManagerError();

    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toMatch(/último Gerente/);
  });
});

describe('assertManagerContinuity: lo que se permite', () => {
  it('permite quitar el rol de Gerente si queda otro Gerente', () => {
    expect(() =>
      assertManagerContinuity({ previousRoles: [Role.GERENTE], newRoles: [], managerCount: 2 })
    ).not.toThrow();
  });

  it('permite cambiar a alguien que no es Gerente', () => {
    expect(() =>
      assertManagerContinuity({ previousRoles: [Role.DESPACHO], newRoles: [], managerCount: 1 })
    ).not.toThrow();
  });

  it('permite que el único Gerente conserve el rol de Gerente', () => {
    expect(() =>
      assertManagerContinuity({
        previousRoles: [Role.GERENTE],
        newRoles: [Role.GERENTE, Role.ATENCION],
        managerCount: 1,
      })
    ).not.toThrow();
  });
});
