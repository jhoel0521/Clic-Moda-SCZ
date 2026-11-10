import { join, sep } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import type { Env } from '../config/env.schema.js';

type DbEnv = Pick<Env, 'DB_HOST' | 'DB_PORT' | 'DB_USER' | 'DB_PASSWORD' | 'DB_NAME'>;

// Desde el JS compilado (dist) cargan los .js; desde las fuentes (pruebas) cargan los .ts.
const ext = import.meta.filename.endsWith('.ts') ? 'ts' : 'js';
const glob = (...parts: string[]) =>
  join(import.meta.dirname, ...parts)
    .split(sep)
    .join('/');

export function buildDataSourceOptions(env: DbEnv): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [glob('..', '**', `*.entity.${ext}`)],
    migrations: [glob('migrations', `*.${ext}`)],
    synchronize: false,
  };
}
