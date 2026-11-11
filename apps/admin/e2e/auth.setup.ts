import { expect, test as setup } from '@playwright/test';
import { AUTH, PASSWORD, type Role } from './support/session';

// Un solo inicio de sesión por rol y corrida (la API limita 5 intentos por correo cada 15 minutos).
for (const role of Object.keys(AUTH) as Role[]) {
  setup(`inicia sesión como ${role}`, async ({ request }) => {
    const response = await request.post('/api/login', { data: { email: `${role}@flows.local`, password: PASSWORD } });

    expect(response.ok()).toBe(true);
    await request.storageState({ path: AUTH[role] });
  });
}
