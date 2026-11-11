// Mapa incrustado de la página de contacto. Solo se incrusta Google Maps:
//  1. una URL de "Insertar un mapa" (google.com/maps/embed) se usa tal cual;
//  2. un enlace largo de Google Maps (maps.google.com/?q=… o /maps/place/…) se convierte en mapa con su mismo lugar;
//  3. un enlace corto (maps.app.goo.gl) se sigue en el SERVIDOR hasta el enlace largo (solo hacia dominios de Google);
//  4. si nada de eso sirve, se busca la dirección del almacén. Sin dirección no hay mapa.
const GOOGLE_HOST = /^((www|maps)\.)?google\.[a-z.]+$/;
const SHORT_HOSTS = ['maps.app.goo.gl', 'goo.gl'];
const MAX_HOPS = 3;
const TIMEOUT_MS = 3_000;

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

const parse = (raw: string): URL | null => {
  if (!URL.canParse(raw)) return null;
  const url = new URL(raw);
  return url.protocol === 'https:' ? url : null;
};

const embedOf = (place: string): string =>
  `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;

// El lugar de un enlace largo de Google Maps.
function placeOf(url: URL): string | null {
  const query = url.searchParams.get('q');
  if (query?.trim()) return query.trim();
  // /maps/place/<nombre>/… o /maps/search/<texto o coordenadas>
  const match = /^\/maps\/(?:place|search)\/([^/]+)/.exec(url.pathname);
  return match?.[1] ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

// Sigue la redirección de un enlace corto sin salir de los dominios permitidos.
async function expand(url: URL, fetcher: Fetcher): Promise<URL | null> {
  let current = url;
  for (let hop = 0; hop < MAX_HOPS && SHORT_HOSTS.includes(current.hostname); hop++) {
    const response = await fetcher(current.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const next = parse(new URL(response.headers.get('location') ?? '', current).toString());
    if (!next || !(GOOGLE_HOST.test(next.hostname) || SHORT_HOSTS.includes(next.hostname)))
      return null;
    current = next;
  }
  return GOOGLE_HOST.test(current.hostname) ? current : null;
}

async function placeFromLink(link: string, fetcher: Fetcher): Promise<string | null> {
  const url = parse(link);
  if (!url) return null;
  if (GOOGLE_HOST.test(url.hostname) && url.pathname.startsWith('/maps/embed')) return null;
  try {
    const full = SHORT_HOSTS.includes(url.hostname) ? await expand(url, fetcher) : url;
    return full && GOOGLE_HOST.test(full.hostname) ? placeOf(full) : null;
  } catch {
    return null; // sin red o sin respuesta: se usa la dirección
  }
}

const isGoogleEmbed = (url: URL): boolean =>
  GOOGLE_HOST.test(url.hostname) && url.pathname.startsWith('/maps/embed');

// Los enlaces cortos no cambian de lugar: se recuerda el resultado para no repetir la consulta.
const remembered = new Map<string, string>();

export async function mapEmbedUrl(
  mapUrl: string | null,
  address: string,
  fetcher: Fetcher = fetch
): Promise<string | null> {
  const url = mapUrl ? parse(mapUrl) : null;
  if (url && isGoogleEmbed(url)) return url.toString();
  if (mapUrl && url) {
    const known = remembered.get(mapUrl);
    const place = known ?? (await placeFromLink(mapUrl, fetcher));
    if (place) {
      remembered.set(mapUrl, place);
      return embedOf(place);
    }
  }
  return address.trim() ? embedOf(address.trim()) : null;
}

export const forgetMaps = (): void => remembered.clear();
