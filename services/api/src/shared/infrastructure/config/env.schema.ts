import { z } from 'zod';

const port = z.coerce.number().int().min(1).max(65535);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: port.default(3000),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: port.default(5432),
  DB_USER: z.string().min(1).default('clic_moda'),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1).default('clic_moda'),
  // Clave con la que se firman los tokens de acceso. Obligatoria y sin valor por defecto.
  AUTH_JWT_KEY: z.string().min(32, 'AUTH_JWT_KEY debe tener al menos 32 caracteres'),
  AUTH_JWT_ISSUER: z.string().min(1).default('clic-moda-api'),
  AUTH_JWT_AUDIENCE: z.string().min(1).default('clic-moda'),
  // Costo de scrypt (2^N). 17 es el valor recomendado; las pruebas lo bajan para ir más rápido.
  AUTH_SCRYPT_LOG_N: z.coerce.number().int().min(10).max(20).default(17),
});

export type Env = z.infer<typeof envSchema>;
