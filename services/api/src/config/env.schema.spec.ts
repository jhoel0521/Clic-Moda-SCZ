import { envSchema } from './env.schema.js';

const base = { DB_PASSWORD: 'secreto' };

describe('envSchema: valores por defecto y obligatorios', () => {
  it('aplica valores por defecto cuando solo hay contraseña de base de datos', () => {
    expect(envSchema.parse(base)).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'clic_moda',
      DB_PASSWORD: 'secreto',
      DB_NAME: 'clic_moda',
    });
  });

  it('exige DB_PASSWORD', () => {
    expect(envSchema.safeParse({}).success).toBe(false);
  });
});

describe('envSchema: conversión y rechazos', () => {
  it('convierte PORT y DB_PORT de texto a número', () => {
    const env = envSchema.parse({ ...base, PORT: '4100', DB_PORT: '5433' });
    expect([env.PORT, env.DB_PORT]).toEqual([4100, 5433]);
  });

  it('rechaza un NODE_ENV desconocido', () => {
    expect(envSchema.safeParse({ ...base, NODE_ENV: 'staging' }).success).toBe(false);
  });

  it.each(['0', '70000', 'abc'])('rechaza el PORT inválido %s', (port) => {
    expect(envSchema.safeParse({ ...base, PORT: port }).success).toBe(false);
  });
});
