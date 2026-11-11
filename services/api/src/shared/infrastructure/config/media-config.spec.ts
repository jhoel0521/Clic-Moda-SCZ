import { envSchema } from './env.schema.js';
import { readMediaConfig } from './media-config.js';

const base = { DB_PASSWORD: 'secreto', AUTH_JWT_KEY: 'k'.repeat(32) };
const s3 = {
  MEDIA_STORAGE: 's3',
  S3_ENDPOINT: 'http://127.0.0.1:10002',
  S3_ACCESS_KEY: 'a',
  S3_SECRET_KEY: 'b',
};

describe('readMediaConfig', () => {
  it('usa disco por defecto', () => {
    expect(readMediaConfig(envSchema.parse(base))).toEqual({ driver: 'disk', dir: '.media' });
  });

  it('arma la configuración de S3 con su bucket por defecto', () => {
    expect(readMediaConfig(envSchema.parse({ ...base, ...s3 }))).toEqual({
      driver: 's3',
      endpoint: 'http://127.0.0.1:10002',
      bucket: 'clic-moda-media',
      accessKey: 'a',
      secretKey: 'b',
    });
  });

  it('exige las claves cuando el almacenamiento es s3', () => {
    const env = envSchema.parse({ ...base, MEDIA_STORAGE: 's3' });
    expect(() => readMediaConfig(env)).toThrow('S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY');
  });

  it('rechaza un almacenamiento desconocido', () => {
    expect(envSchema.safeParse({ ...base, MEDIA_STORAGE: 'ftp' }).success).toBe(false);
  });
});
