import { spawnSync } from 'node:child_process';
import { userInfo } from 'node:os';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { resetDatabase, seedStaff } from '../support/identity.js';

const CLI = join(process.cwd(), 'dist/identity/infrastructure/cli/assign-roles.js');
let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
});

beforeEach(async () => {
  await resetDatabase(app);
  await seedStaff(app, 'jefe@tienda.com', [Role.GERENTE]);
  await seedStaff(app, 'ana@tienda.com', [Role.ATENCION]);
});

afterAll(async () => {
  await app.close();
});

// Ejecuta el comando COMPILADO como proceso (sin pnpm ni npx). Sin terminal: stdin no es un TTY.
function runCli(args: string[]) {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    env: process.env,
    encoding: 'utf8',
  });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

const rolesOf = async (email: string): Promise<string[]> => {
  const rows = await app
    .get(DataSource)
    .query(`SELECT r.role FROM user_roles r JOIN users u ON u.id = r.user_id WHERE u.email = $1`, [
      email,
    ]);
  return rows.map((row: { role: string }) => row.role).sort();
};

describe('assign-roles (compilado): con opciones', () => {
  it('asigna los roles, deja el resultado y registra al usuario del sistema como operador', async () => {
    const { code, out } = runCli([
      '--email',
      'ana@tienda.com',
      '--roles',
      'GERENTE,DESPACHO',
      '--yes',
    ]);
    const [event] = await app.get(DataSource).query('SELECT operator FROM user_role_events');

    expect(code).toBe(0);
    expect(out).toContain('Listo: ana@tienda.com');
    expect(await rolesOf('ana@tienda.com')).toEqual(['DESPACHO', 'GERENTE']);
    expect(event.operator).toBe(userInfo().username);
  });

  it('--help muestra el uso y sale con 0', () => {
    const { code, out } = runCli(['--help']);

    expect([code, out]).toEqual([0, expect.stringContaining('--email <correo>')]);
  });
});

describe('assign-roles (compilado): sin terminal', () => {
  it('sin terminal y sin opciones explica cómo usarlo y no cambia nada', async () => {
    const { code, out } = runCli([]);

    expect(code).toBe(1);
    expect(out).toContain('--email, --roles y --yes');
    expect(await rolesOf('ana@tienda.com')).toEqual(['ATENCION']);
  });

  it('con opciones pero sin --yes y sin terminal falla y no cambia nada', async () => {
    const { code, out } = runCli(['--email', 'ana@tienda.com', '--roles', 'GERENTE']);

    expect([code, out.includes('--yes')]).toEqual([1, true]);
    expect(await rolesOf('ana@tienda.com')).toEqual(['ATENCION']);
  });

  it('--email sin --roles es un error de uso', () => {
    expect(runCli(['--email', 'ana@tienda.com']).code).toBe(1);
  });
});

describe('assign-roles (compilado): fallos de negocio', () => {
  it('un correo que no existe falla con un mensaje claro', () => {
    const { code, out } = runCli(['--email', 'nadie@tienda.com', '--roles', 'GERENTE', '--yes']);

    expect([code, out.includes('No existe un usuario')]).toEqual([1, true]);
  });

  it('quitar el rol al único Gerente se rechaza y el sistema conserva su Gerente', async () => {
    const { code, out } = runCli(['--email', 'jefe@tienda.com', '--roles', 'DESPACHO', '--yes']);

    expect([code, out.includes('último Gerente')]).toEqual([1, true]);
    expect(await rolesOf('jefe@tienda.com')).toEqual(['GERENTE']);
  });
});
