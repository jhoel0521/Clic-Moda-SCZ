import { z } from 'zod';

const port = z.coerce.number().int().min(1).max(65535);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: port.default(10010),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: port.default(10001),
  DB_USER: z.string().min(1).default('clic_moda'),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1).default('clic_moda'),
  // Almacenamiento de imágenes: "s3" (SeaweedFS, aislado) o "disk" (respaldo local). Las claves de S3
  // solo se exigen con "s3" (lo valida readMediaConfig al construir el módulo de medios).
  MEDIA_STORAGE: z.enum(['s3', 'disk']).default('disk'),
  S3_ENDPOINT: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(3).default('clic-moda-media'),
  S3_ACCESS_KEY: z.string().min(1).optional(),
  S3_SECRET_KEY: z.string().min(1).optional(),
  MEDIA_DISK_DIR: z.string().min(1).default('.media'),
  // Clave con la que se firman los tokens de acceso. Obligatoria y sin valor por defecto.
  AUTH_JWT_KEY: z.string().min(32, 'AUTH_JWT_KEY debe tener al menos 32 caracteres'),
  AUTH_JWT_ISSUER: z.string().min(1).default('clic-moda-api'),
  AUTH_JWT_AUDIENCE: z.string().min(1).default('clic-moda'),
  // Costo de scrypt (2^N). 17 es el valor recomendado; las pruebas lo bajan para ir más rápido.
  AUTH_SCRYPT_LOG_N: z.coerce.number().int().min(10).max(20).default(17),
  // Procesador de la cola de stock: "off" lo desactiva (otro proceso o pruebas) y POLL_MS es la espera sin trabajo.
  STOCK_QUEUE_WORKER: z.enum(['on', 'off']).default('on'),
  STOCK_QUEUE_POLL_MS: z.coerce.number().int().min(20).max(10000).default(200),
  // Despachador de eventos: "off" lo apaga (los eventos quedan guardados y se entregan al encenderlo).
  EVENT_DISPATCHER: z.enum(['on', 'off']).default('on'),
  EVENT_DISPATCH_POLL_MS: z.coerce.number().int().min(20).max(10000).default(500),
});

export type Env = z.infer<typeof envSchema>;
