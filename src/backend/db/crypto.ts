/**
 * DEMO: no hay servidor ni contraseñas reales.
 * Las cuentas de ejemplo usan una clave pública y las cuentas registradas en la demo
 * no guardan la contraseña escrita (se marcan con '*').
 */
export const ANY_PASSWORD = '*';

export function verifyPassword(plain: string, stored: string): boolean {
  return stored === ANY_PASSWORD ? plain.length > 0 : plain === stored;
}
