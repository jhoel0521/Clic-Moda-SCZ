// Mapa incrustado de la página de contacto. Solo se incrusta Google Maps: una URL de "Insertar un mapa"
// (google.com/maps/embed) se usa tal cual; con cualquier otro enlace (p. ej. un enlace corto maps.app.goo.gl,
// que no se puede incrustar) se busca la dirección del almacén. Sin ninguna de las dos no hay mapa.
const isGoogleEmbed = (url: URL): boolean =>
  /^(www\.)?google\.[a-z.]+$/.test(url.hostname) && url.pathname.startsWith('/maps/embed');

export function mapEmbedUrl(mapUrl: string | null, address: string): string | null {
  if (mapUrl && URL.canParse(mapUrl)) {
    const url = new URL(mapUrl);
    if (url.protocol === 'https:' && isGoogleEmbed(url)) return url.toString();
  }
  const place = address.trim();
  return place ? `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed` : null;
}
