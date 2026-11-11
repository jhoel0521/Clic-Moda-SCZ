import type { Env } from './env.schema.js';

export type MediaConfig =
  | { driver: 'disk'; dir: string }
  | { driver: 's3'; endpoint: string; bucket: string; accessKey: string; secretKey: string };

const REQUIRED_S3 = ['S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY'] as const;

/** Convierte las variables de entorno en la configuración del almacenamiento de imágenes. */
export function readMediaConfig(env: Env): MediaConfig {
  if (env.MEDIA_STORAGE === 'disk') return { driver: 'disk', dir: env.MEDIA_DISK_DIR };
  const missing = REQUIRED_S3.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`MEDIA_STORAGE=s3 exige definir: ${missing.join(', ')}`);
  }
  return {
    driver: 's3',
    endpoint: env.S3_ENDPOINT as string,
    bucket: env.S3_BUCKET,
    accessKey: env.S3_ACCESS_KEY as string,
    secretKey: env.S3_SECRET_KEY as string,
  };
}
