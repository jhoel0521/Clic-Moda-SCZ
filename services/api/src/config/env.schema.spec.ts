import { envSchema } from './env.schema.js';

describe('envSchema', () => {
  it('aplica valores por defecto cuando no hay variables', () => {
    expect(envSchema.parse({})).toEqual({ NODE_ENV: 'development', PORT: 3000 });
  });

  it('convierte PORT de texto a número', () => {
    expect(envSchema.parse({ PORT: '4100' }).PORT).toBe(4100);
  });

  it('rechaza un NODE_ENV desconocido', () => {
    expect(envSchema.safeParse({ NODE_ENV: 'staging' }).success).toBe(false);
  });

  it.each(['0', '70000', 'abc'])('rechaza el PORT inválido %s', (port) => {
    expect(envSchema.safeParse({ PORT: port }).success).toBe(false);
  });
});
