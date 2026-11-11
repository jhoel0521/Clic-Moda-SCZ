import { expect, it } from 'vitest';
import { can, encodeSession, readSession, safeNext, type Session } from './session';

const session = (roles: Session['user']['roles'], expiresAt = Date.now() + 60_000): Session => ({
  token: 'jwt',
  user: { id: 'u1', email: 'a@b.c', name: 'Ana', roles },
  expiresAt,
});

it('lectura de la cookie de sesión — devuelve la sesión vigente', () => {
  const value = session(['GERENTE']);

  expect(readSession(encodeSession(value))?.user.email).toBe('a@b.c');
});

it('lectura de la cookie de sesión — rechaza una sesión vencida, mal formada o ausente', () => {
  expect(readSession(encodeSession(session(['GERENTE'], 1)))).toBeNull();
  expect(readSession('no-es-json')).toBeNull();
  expect(readSession(undefined)).toBeNull();
});

it('permisos por rol — el Gerente modifica catálogo y stock', () => {
  expect([can(session(['GERENTE']), 'catalog:write'), can(session(['GERENTE']), 'stock:write')]).toEqual([true, true]);
});

it('permisos por rol — Despacho solo modifica el stock y Atención solo consulta', () => {
  expect([can(session(['DESPACHO']), 'catalog:write'), can(session(['DESPACHO']), 'stock:write')]).toEqual([
    false,
    true,
  ]);
  expect(can(session(['ATENCION']), 'stock:write')).toBe(false);
  expect(can(null, 'stock:write')).toBe(false);
});

it('destino tras iniciar sesión — solo acepta rutas internas', () => {
  expect(safeNext('/productos')).toBe('/productos');
  expect(safeNext('//malo.com')).toBe('/');
  expect(safeNext('https://malo.com')).toBe('/');
  expect(safeNext(null)).toBe('/');
});
