import { DataSource } from 'typeorm';
import { envSchema } from '../config/env.schema.js';
import { buildDataSourceOptions } from './database.config.js';

// DataSource para la CLI de TypeORM (migraciones). La aplicación usa DatabaseModule.
export default new DataSource(buildDataSourceOptions(envSchema.parse(process.env)));
