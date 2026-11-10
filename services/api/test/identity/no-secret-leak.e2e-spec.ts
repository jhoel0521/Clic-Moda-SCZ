import { type INestApplication, Logger, type LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { resetDatabase, seedStaff, STAFF_PASSWORD } from '../support/identity.js';

// Todo lo que el sistema "dice": respuestas HTTP y logs.
const spoken: string[] = [];

class CapturingLogger implements LoggerService {
  log = (message: unknown) => void spoken.push(String(message));
  error = (message: unknown) => void spoken.push(String(message));
  warn = (message: unknown) => void spoken.push(String(message));
  debug = (message: unknown) => void spoken.push(String(message));
  verbose = (message: unknown) => void spoken.push(String(message));
}

let app: INestApplication<App>;
let storedHash = '';

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  app.useLogger(new CapturingLogger());
  await app.init();
  await resetDatabase(app);
  await seedStaff(app, 'ana@tienda.com', [Role.GERENTE]);
  const [row] = await app.get(DataSource).query('SELECT password_hash FROM users');
  storedHash = row.password_hash;
});

afterAll(async () => {
  await app.close();
});

const post = (body: object) => request(app.getHttpServer()).post('/auth/login').send(body);

// Recorre éxito y todos los fallos, y devuelve cada cuerpo de respuesta como texto.
async function exercise(): Promise<string[]> {
  const ok = await post({ email: 'ana@tienda.com', password: STAFF_PASSWORD });
  const bodies = [ok.text];
  bodies.push((await post({ email: 'ana@tienda.com', password: 'contraseña-incorrecta' })).text);
  bodies.push((await post({ email: 'nadie@tienda.com', password: 'otra-incorrecta' })).text);
  bodies.push((await post({ email: 'ana@tienda.com' })).text);
  const token = ok.body.accessToken;
  bodies.push(
    (await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${token}`))
      .text
  );
  bodies.push((await request(app.getHttpServer()).get('/auth/me')).text);
  return bodies;
}

describe('Sin filtraciones de secretos', () => {
  it('ninguna respuesta de error contiene la contraseña, el hash ni el nombre del algoritmo', async () => {
    const [, wrong, unknown, invalid, me, anonymous] = await exercise();
    const errorsAndProfile = [wrong, unknown, invalid, me, anonymous].join('\n');

    expect(errorsAndProfile).not.toContain(STAFF_PASSWORD);
    expect(errorsAndProfile).not.toContain('contraseña-incorrecta');
    expect(errorsAndProfile).not.toMatch(/scrypt/);
    expect(errorsAndProfile).not.toContain(storedHash);
  });

  it('la respuesta del login no contiene la contraseña ni el hash', async () => {
    const [ok] = await exercise();

    expect(ok).not.toContain(STAFF_PASSWORD);
    expect(ok).not.toContain(storedHash);
  });
});

describe('Sin filtraciones en los logs', () => {
  it('ni el logger de Nest ni stdout/stderr muestran contraseñas, hashes ni tokens', async () => {
    const written: string[] = [];
    const out = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk) => (written.push(String(chunk)), true));
    const err = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((chunk) => (written.push(String(chunk)), true));
    const bodies = await exercise();
    out.mockRestore();
    err.mockRestore();

    const logs = [...spoken, ...written].join('\n');
    const token = JSON.parse(bodies[0]).accessToken as string;
    for (const secret of [
      STAFF_PASSWORD,
      'contraseña-incorrecta',
      'otra-incorrecta',
      storedHash,
      token,
    ]) {
      expect(logs).not.toContain(secret);
    }
  });
});

describe('Control positivo de la captura', () => {
  it('la captura ve lo que escribe el logger de Nest y lo que se escribe en stdout', () => {
    const written: string[] = [];
    const out = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk) => (written.push(String(chunk)), true));
    new Logger('Control').log('centinela-logger-123');
    process.stdout.write('centinela-stdout-456');
    out.mockRestore();

    expect(spoken.join('\n')).toContain('centinela-logger-123');
    expect(written.join('\n')).toContain('centinela-stdout-456');
  });
});
