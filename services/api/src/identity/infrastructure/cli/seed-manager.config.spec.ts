import { readSeedConfig, SeedConfigError } from './seed-manager.config.js';

const valid = {
  INITIAL_MANAGER_EMAIL: 'gerente@tienda.com',
  INITIAL_MANAGER_PASSWORD: 'clave-de-gerente-1',
};

describe('readSeedConfig', () => {
  it('lee los valores y usa "Gerente" como nombre por defecto', () => {
    expect(readSeedConfig(valid)).toMatchObject({
      email: 'gerente@tienda.com',
      password: 'clave-de-gerente-1',
      name: 'Gerente',
    });
  });

  it('usa INITIAL_MANAGER_NAME si está definida', () => {
    expect(readSeedConfig({ ...valid, INITIAL_MANAGER_NAME: 'Ana Pérez' }).name).toBe('Ana Pérez');
  });
});

describe('readSeedConfig: configuración ausente o inválida', () => {
  it('nombra las DOS variables cuando faltan ambas', () => {
    expect(() => readSeedConfig({})).toThrow(
      'Faltan variables de entorno: INITIAL_MANAGER_EMAIL, INITIAL_MANAGER_PASSWORD'
    );
  });

  it('nombra solo la que falta', () => {
    expect(() => readSeedConfig({ INITIAL_MANAGER_EMAIL: 'a@b.com' })).toThrow(
      'Faltan variables de entorno: INITIAL_MANAGER_PASSWORD'
    );
  });

  it('trata un valor vacío o en blanco como ausente', () => {
    expect(() => readSeedConfig({ ...valid, INITIAL_MANAGER_EMAIL: '   ' })).toThrow(
      SeedConfigError
    );
  });

  it('rechaza una contraseña de menos de 12 caracteres', () => {
    expect(() => readSeedConfig({ ...valid, INITIAL_MANAGER_PASSWORD: 'corta' })).toThrow(
      /12 caracteres/
    );
  });
});
