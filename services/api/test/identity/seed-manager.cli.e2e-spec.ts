import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { truncateAll } from '../support/db.js';

const CLI = join(process.cwd(), 'dist/identity/infrastructure/cli/seed-manager.js');
const VALID = {
  INITIAL_MANAGER_EMAIL: 'gerente@tienda.com',
  INITIAL_MANAGER_PASSWORD: 'clave-de-gerente-1',
};

let moduleRef: TestingModule;
let dataSource: DataSource;

beforeAll(async () => {
  moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  dataSource = moduleRef.get(DataSource);
});

beforeEach(async () => {
  await truncateAll(dataSource);
});

afterAll(async () => {
  await moduleRef.close();
});

// Ejecuta el comando COMPILADO como proceso independiente (como en producción: sin pnpm ni npx).
function runSeed(extraEnv: Record<string, string | undefined>) {
  const env = {
    ...process.env,
    INITIAL_MANAGER_EMAIL: '',
    INITIAL_MANAGER_PASSWORD: '',
    ...extraEnv,
  };
  const result = spawnSync(process.execPath, [CLI], { env, encoding: 'utf8' });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

async function countManagers(): Promise<number> {
  const rows = await dataSource.query(
    "SELECT count(*)::int AS n FROM user_roles WHERE role = 'GERENTE'"
  );
  return rows[0].n;
}

describe('seed:manager (e2e, compilado): primer arranque', () => {
  it('crea el Gerente con la contraseña hasheada', async () => {
    const { code, out } = runSeed(VALID);
    const [{ password_hash: hash }] = await dataSource.query('SELECT password_hash FROM users');

    expect([code, await countManagers()]).toEqual([0, 1]);
    expect(out).toContain('Gerente creado: gerente@tienda.com');
    expect(hash).toMatch(/^\$scrypt\$/);
  });
});

describe('seed:manager (e2e, compilado): ejecución repetida', () => {
  it('no crea otro Gerente ni falla', async () => {
    runSeed(VALID);
    const { code, out } = runSeed(VALID);

    expect([code, await countManagers()]).toEqual([0, 1]);
    expect(out).toContain('Ya existe un Gerente');
  });
});

describe('seed:manager (e2e, compilado): configuración ausente', () => {
  it('falla nombrando las variables y no crea nada', async () => {
    const { code, out } = runSeed({});

    expect(code).toBe(1);
    expect(out).toContain('INITIAL_MANAGER_EMAIL, INITIAL_MANAGER_PASSWORD');
    expect(await dataSource.query('SELECT 1 FROM users')).toHaveLength(0);
  });
});
