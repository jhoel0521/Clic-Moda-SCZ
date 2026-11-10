import { join, sep } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import type { Env } from '../config/env.schema.js';

type DbEnv = Pick<Env, 'DB_HOST' | 'DB_PORT' | 'DB_USER' | 'DB_PASSWORD' | 'DB_NAME'>;

// Desde el JS compilado (dist) cargan los .js. Desde las fuentes (pruebas) las migraciones .ts se
// importan directamente, pero las entidades llevan decoradores, que el cargador nativo de Node no
// soporta: ahí las registra Nest (autoLoadEntities) y el glob de entidades no se usa.
const ext = import.meta.filename.endsWith('.ts') ? 'ts' : 'js';
const glob = (...parts: string[]) =>
  join(import.meta.dirname, ...parts)
    .split(sep)
    .join('/');

// Raíz de src: este archivo está en src/shared/infrastructure/database.
const SRC = ['..', '..', '..'];

export function buildDataSourceOptions(env: DbEnv): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: ext === 'js' ? [glob(...SRC, '**', '*.orm-entity.js')] : [],
    migrations: [glob('migrations', `*.${ext}`)],
    synchronize: false,
  };
}
