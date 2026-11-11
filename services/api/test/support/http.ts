import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { resetDatabase, seedStaff, STAFF_PASSWORD } from './identity.js';

export interface StaffTokens {
  gerente: string;
  despacho: string;
  atencion: string;
}

export async function startApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  await app.init();
  return app;
}

async function login(app: INestApplication<App>, email: string): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: STAFF_PASSWORD })
    .expect(200);
  return res.body.accessToken;
}

// Limpia la base y crea un usuario por rol (Gerente, Despacho y Atención) con su token de acceso.
export async function seedTokens(app: INestApplication<App>): Promise<StaffTokens> {
  await resetDatabase(app);
  const roles = { gerente: Role.GERENTE, despacho: Role.DESPACHO, atencion: Role.ATENCION };
  const tokens: Partial<StaffTokens> = {};
  for (const [key, role] of Object.entries(roles)) {
    await seedStaff(app, `${key}@tienda.com`, [role]);
    tokens[key as keyof StaffTokens] = await login(app, `${key}@tienda.com`);
  }
  return tokens as StaffTokens;
}

type Method = 'get' | 'post' | 'patch' | 'delete';

// Llamada HTTP con token opcional y cuerpo opcional.
export function call(
  app: INestApplication<App>,
  method: Method,
  path: string,
  token?: string,
  body?: object
): request.Test {
  const req = request(app.getHttpServer())[method](path);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return body ? req.send(body) : req;
}

const CATALOG_TABLES = [
  'stock_movements',
  'stock_commands',
  'stock_levels',
  'product_variants',
  'products',
  'categories',
];

// Vacía solo las tablas de catálogo e inventario (conserva usuarios y sesiones: iniciar sesión en
// cada caso agotaría el límite de intentos de acceso). Se niega a actuar fuera de una base de pruebas.
export async function resetCatalog(app: INestApplication<App>): Promise<void> {
  const dataSource = app.get(DataSource);
  const [row] = await dataSource.query('select current_database() as db');
  if (!String(row.db).endsWith('_test'))
    throw new Error('Se niega a limpiar una base que no es de pruebas');
  const tables = CATALOG_TABLES.map((table) => `"${table}"`).join(', ');
  await dataSource.query(`TRUNCATE ${tables} CASCADE`);
}
