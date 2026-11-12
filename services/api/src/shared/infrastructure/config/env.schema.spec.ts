import { envSchema } from './env.schema.js';

const KEY = 'k'.repeat(32);
const base = { DB_PASSWORD: 'secreto', AUTH_JWT_KEY: KEY };

const DEFAULTS = {
  NODE_ENV: 'development',
  PORT: 10010,
  DB_HOST: 'localhost',
  DB_PORT: 10001,
  DB_USER: 'clic_moda',
  DB_PASSWORD: 'secreto',
  DB_NAME: 'clic_moda',
  MEDIA_STORAGE: 'disk',
  S3_BUCKET: 'clic-moda-media',
  MEDIA_DISK_DIR: '.media',
  AUTH_JWT_KEY: KEY,
  AUTH_JWT_ISSUER: 'clic-moda-api',
  AUTH_JWT_AUDIENCE: 'clic-moda',
  AUTH_SCRYPT_LOG_N: 17,
  STOCK_QUEUE_WORKER: 'on',
  STOCK_QUEUE_POLL_MS: 200,
  EVENT_DISPATCHER: 'on',
  EVENT_DISPATCH_POLL_MS: 500,
};

describe('envSchema: valores por defecto y obligatorios', () => {
  it('aplica valores por defecto cuando solo hay contraseña de base de datos', () => {
    expect(envSchema.parse(base)).toEqual(DEFAULTS);
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

describe('envSchema: autenticación', () => {
  it('exige AUTH_JWT_KEY', () => {
    expect(envSchema.safeParse({ DB_PASSWORD: 'secreto' }).success).toBe(false);
  });

  it('rechaza una AUTH_JWT_KEY demasiado corta', () => {
    expect(envSchema.safeParse({ DB_PASSWORD: 'secreto', AUTH_JWT_KEY: 'corta' }).success).toBe(
      false
    );
  });

  it.each(['9', '21', 'abc'])('rechaza un AUTH_SCRYPT_LOG_N fuera de rango (%s)', (logN) => {
    expect(envSchema.safeParse({ ...base, AUTH_SCRYPT_LOG_N: logN }).success).toBe(false);
  });
});
