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
});

export type Env = z.infer<typeof envSchema>;
