import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';

export const PASSWORD = 'FlowsTestPassword1';
export const ADMIN = 'http://localhost:10019';
export const AUTH = {
  gerente: 'e2e/.auth/gerente.json',
  despacho: 'e2e/.auth/despacho.json',
  atencion: 'e2e/.auth/atencion.json',
} as const;

export type Role = keyof typeof AUTH;

// Nombre único dentro de la corrida (la base de flujos se recrea limpia en cada corrida).
export const unique = (prefix: string): string => `${prefix} ${Date.now().toString(36)}`;

// Cliente HTTP ya autenticado (cookie del rol) contra el panel, para preparar datos sin pasar por la pantalla.
export const asRole = (role: Role): Promise<APIRequestContext> =>
  playwrightRequest.newContext({ baseURL: ADMIN, storageState: AUTH[role] });

export async function createProduct(api: APIRequestContext, name: string): Promise<{ categoryName: string }> {
  const categoryName = `Cat ${name}`;
  const category = await (await api.post('/api/catalog/categories', { data: { name: categoryName } })).json();
  const variants = [{ size: '38', color: 'Negro', price: '250.00' }];
  await api.post('/api/catalog/products', { data: { categoryId: category.id, name, variants } });
  return { categoryName };
}
