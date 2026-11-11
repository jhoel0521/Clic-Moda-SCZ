// Cliente de la API del lado del servidor: nunca se ejecuta en el navegador. La API solo es
// alcanzable desde esta red interna; el navegador y los rastreadores solo conocen el dominio de la tienda.
export const apiBase = (): string =>
  (import.meta.env.API_URL ?? process.env.API_URL ?? 'http://localhost:10010').replace(/\/$/, '');
